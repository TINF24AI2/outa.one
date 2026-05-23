import { fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import { requestLicenseSchema, type ProductItem } from "$lib/schemas/request-license";
import { requireAuthenticatedUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";
import { assignUserToLicense } from "$lib/server/licenses";

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

  const enrichedProducts: ProductItem[] = products.map((p) => {
    const pLicenses = licenses.filter((l) => l.productId === p.id);

    let available = 0;
    let licenseType: "single" | "volume" = "single";

    for (const lic of pLicenses) {
      if (lic.usageVolume === 0) {
        available = -1;
        licenseType = "volume";
        break;
      }
      const assigned = assignmentCounts.get(lic.id) ?? 0;
      available += Math.max(0, lic.usageVolume - assigned);
      if (lic.usageVolume !== 1) licenseType = "volume";
    }

    const userHeld = pLicenses.filter((l) => userLicenseIds.has(l.id)).length;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      requiresApproval: p.requiresApproval,
      maxLicensesPerUser: p.maxLicensesPerUser,
      available,
      userHeld,
      licenseType,
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

      await db.insert(licenseRequest).values({
        userId: user.id,
        productId: form.data.productId,
        status: "pending",
      });

      return { form, pending: true, productName: prod.name };
    }

    const productLicenses = await db
      .select({ id: license.id, key: license.key })
      .from(license)
      .where(eq(license.productId, form.data.productId));

    for (const lic of productLicenses) {
      const result = await assignUserToLicense(lic.id, user.id);
      if (result.ok) {
        return { form, licenseKey: lic.key, productName: prod.name };
      }
      if (result.reason === "user_at_product_cap") {
        return message(form, m.request_error_at_cap(), { status: 409 });
      }
    }

    return message(form, m.request_error_no_available(), { status: 409 });
  },
};
