import { fail } from "@sveltejs/kit";
import { and, eq, notInArray } from "drizzle-orm";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import { requestLicenseSchema, type ProductItem } from "$lib/schemas/request-license";
import { createAuditLog } from "$lib/server/audit";
import { requireAuthenticatedUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { user as userTable } from "$lib/server/db/auth.schema";
import { license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";
import { licenseRequestNotificationEmail } from "$lib/server/email-templates";
import { assignUserToLicense } from "$lib/server/licenses";
import { sendEmail } from "$lib/server/mail";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = requireAuthenticatedUser(event);

  const [products, licenses, allAssignments, userAssignments] = await Promise.all([
    db.select().from(product),
    db.select({ id: license.id, productId: license.productId, usageVolume: license.usageVolume }).from(license),
    db.select({ licenseId: licenseUser.licenseId }).from(licenseUser),
    db.select({ licenseId: licenseUser.licenseId }).from(licenseUser).where(eq(licenseUser.userId, user.id)),
  ]);

  const assignmentCounts = new Map<string, number>();
  for (const a of allAssignments) {
    assignmentCounts.set(a.licenseId, (assignmentCounts.get(a.licenseId) ?? 0) + 1);
  }

  const userLicenseIds = new Set(userAssignments.map((a) => a.licenseId));

  const userActivationCounts = new Map<string, number>();
  for (const a of userAssignments) {
    userActivationCounts.set(a.licenseId, (userActivationCounts.get(a.licenseId) ?? 0) + 1);
  }

  const enrichedProducts: ProductItem[] = products.map((p) => {
    const pLicenses = licenses.filter((l) => l.productId === p.id);

    let available = 0;
    let licenseType: "single" | "volume" = "single";
    let userHasVolumeWithCapacity = false;

    for (const lic of pLicenses) {
      if (lic.usageVolume === 0) {
        available = -1;
        licenseType = "volume";
        if (userLicenseIds.has(lic.id)) userHasVolumeWithCapacity = true;
        break;
      }
      const assigned = assignmentCounts.get(lic.id) ?? 0;
      const remaining = Math.max(0, lic.usageVolume - assigned);
      if (lic.usageVolume !== 1) licenseType = "volume";

      if (userLicenseIds.has(lic.id)) {
        if (lic.usageVolume > 1 && remaining > 0) {
          userHasVolumeWithCapacity = true;
          available += remaining;
        }
      } else {
        available += remaining;
      }
    }

    const userHeld = pLicenses.reduce((sum, l) => sum + (userActivationCounts.get(l.id) ?? 0), 0);

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      requiresApproval: p.requiresApproval,
      maxLicensesPerUser: p.maxLicensesPerUser,
      available,
      userHeld,
      licenseType,
      userHasVolumeWithCapacity,
    };
  });

  const form = await superValidate(zod(requestLicenseSchema), { id: "request-license", errors: false });

  return { products: enrichedProducts, form };
};

export const actions: Actions = {
  requestLicense: async (event) => {
    const user = requireAuthenticatedUser(event);

    const form = await superValidate(event.request, zod(requestLicenseSchema));
    if (!form.valid) return fail(400, { form });

    const [prod] = await db.select().from(product).where(eq(product.id, form.data.productId));
    if (!prod) return message(form, m.request_error_not_found(), { status: 404 });

    if (prod.requiresApproval) {
      const [existing] = await db
        .select({ id: licenseRequest.id })
        .from(licenseRequest)
        .where(
          and(
            eq(licenseRequest.userId, user.id),
            eq(licenseRequest.productId, form.data.productId),
            eq(licenseRequest.status, "pending"),
          ),
        );

      if (existing) {
        return message(form, m.request_error_already_pending(), { status: 409 });
      }

      const [insertedRequest] = await db
        .insert(licenseRequest)
        .values({
          userId: user.id,
          productId: form.data.productId,
          status: "pending",
        })
        .returning({ id: licenseRequest.id });

      await createAuditLog(event, {
        action: "license_request.submitted",
        entityType: "license_request",
        entityId: insertedRequest?.id,
        metadata: {
          targetUserId: user.id,
          productId: form.data.productId,
          productName: prod.name,
        },
      });

      const admins = await db
        .select({ email: userTable.email, name: userTable.name })
        .from(userTable)
        .where(eq(userTable.role, "admin"));

      await Promise.allSettled(
        admins
          .filter((admin) => !admin.email.endsWith("@company.com"))
          .map((admin) =>
            sendEmail({
              to: admin.email,
              subject: `License request for ${prod.name}`,
              html: licenseRequestNotificationEmail(user.name, user.email, prod.name),
            }),
          ),
      );

      return { form, pending: true, productName: prod.name };
    }

    const alreadyAssigned = await db
      .select({ licenseId: licenseUser.licenseId, key: license.key, usageVolume: license.usageVolume })
      .from(licenseUser)
      .innerJoin(license, eq(license.id, licenseUser.licenseId))
      .where(and(eq(licenseUser.userId, user.id), eq(license.productId, form.data.productId)));

    const seenLicenseIds = new Set<string>();
    for (const held of alreadyAssigned) {
      if (held.usageVolume === 1 || seenLicenseIds.has(held.licenseId)) continue;
      seenLicenseIds.add(held.licenseId);
      const result = await assignUserToLicense(held.licenseId, user.id);
      if (result.ok) {
        await createAuditLog(event, {
          action: "license.user_assigned",
          entityType: "license",
          entityId: held.licenseId,
          metadata: {
            targetUserId: user.id,
            productId: form.data.productId,
            productName: prod.name,
            licenseKey: held.key,
          },
        });
        return { form, licenseKey: held.key, productName: prod.name, sameVolumeLicense: true };
      }
      if (result.reason === "user_at_product_cap") {
        return message(form, m.request_error_at_cap(), { status: 409 });
      }
    }

    const excludeIds = [...new Set(alreadyAssigned.map((r) => r.licenseId))];

    const productLicenses = await db
      .select({ id: license.id, key: license.key })
      .from(license)
      .where(
        excludeIds.length > 0
          ? and(eq(license.productId, form.data.productId), notInArray(license.id, excludeIds))
          : eq(license.productId, form.data.productId),
      );

    for (const lic of productLicenses) {
      const result = await assignUserToLicense(lic.id, user.id);
      if (result.ok) {
        await createAuditLog(event, {
          action: "license.user_assigned",
          entityType: "license",
          entityId: lic.id,
          metadata: {
            targetUserId: user.id,
            productId: form.data.productId,
            productName: prod.name,
            licenseKey: lic.key,
          },
        });
        return { form, licenseKey: lic.key, productName: prod.name };
      }
      if (result.reason === "user_at_product_cap") {
        return message(form, m.request_error_at_cap(), { status: 409 });
      }
    }

    return message(form, m.request_error_no_available(), { status: 409 });
  },
};
