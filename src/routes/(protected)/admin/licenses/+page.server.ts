import { fail, type Actions } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import {
  assignLicenseUserSchema,
  createLicenseSchema,
  deleteLicenseSchema,
  unassignLicenseUserSchema,
} from "$lib/schemas/licenses";
import { createAuditLog } from "$lib/server/audit";
import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, licenseUser, product, user } from "$lib/server/db/schema";
import { assignUserToLicense, unassignUserFromLicense } from "$lib/server/licenses";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const [licenses, products, users, assignments] = await Promise.all([
    db
      .select({
        id: license.id,
        key: license.key,
        usageVolume: license.usageVolume,
        createdAt: license.createdAt,
        productId: license.productId,
        productName: product.name,
      })
      .from(license)
      .leftJoin(product, eq(license.productId, product.id))
      .orderBy(license.createdAt),
    db.select({ id: product.id, name: product.name }).from(product),
    db.select({ id: user.id, name: user.name, email: user.email }).from(user).orderBy(user.name),
    db
      .select({ licenseId: licenseUser.licenseId, userId: user.id, userName: user.name })
      .from(licenseUser)
      .innerJoin(user, eq(licenseUser.userId, user.id)),
  ]);

  const assignmentsByLicense = assignments.reduce<Record<string, { id: string; name: string }[]>>((acc, a) => {
    (acc[a.licenseId] ??= []).push({ id: a.userId, name: a.userName });
    return acc;
  }, {});

  const enrichedLicenses = licenses.map((lic) => ({
    ...lic,
    assignedUsers: assignmentsByLicense[lic.id] ?? [],
  }));

  const deleteForms = await Promise.all(
    licenses.map((lic) =>
      superValidate({ licenseId: lic.id }, zod(deleteLicenseSchema), { id: `delete-license-${lic.id}` }),
    ),
  );

  return {
    licenses: enrichedLicenses,
    products,
    users,
    form: await superValidate({ usageVolume: 1 }, zod(createLicenseSchema), { id: "create-license", errors: false }),
    deleteForms,
  };
};

export const actions: Actions = {
  createLicense: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(createLicenseSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const [inserted] = await db.insert(license).values(form.data).returning({ id: license.id });
      await createAuditLog(event, {
        action: "license.created",
        entityType: "license",
        entityId: inserted?.id,
        metadata: { productId: form.data.productId },
      });
      return { form };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "23505") {
        return setError(form, "key", "This key already exists for the selected product", { status: 409 });
      }
      console.error("Error creating license:", error);
      return message(form, "Failed to create license", { status: 500 });
    }
  },

  deleteLicense: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(deleteLicenseSchema));
    if (!form.valid) return fail(400, { form });

    try {
      await db.delete(license).where(eq(license.id, form.data.licenseId));
      await createAuditLog(event, { action: "license.deleted", entityType: "license", entityId: form.data.licenseId });
      return { form };
    } catch (error) {
      console.error("Error deleting license:", error);
      return message(form, "Failed to delete license", { status: 500 });
    }
  },

  assignUser: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(assignLicenseUserSchema));
    if (!form.valid) return fail(400, { form });

    const res = await assignUserToLicense(form.data.licenseId, form.data.userId);
    if (!res.ok) {
      let userAtCapMsg = m.licenses_assign_error_user_at_product_cap();
      if (res.reason === "user_at_product_cap") {
        const [u] = await db.select({ name: user.name }).from(user).where(eq(user.id, form.data.userId));
        if (u?.name) userAtCapMsg = m.licenses_assign_error_user_at_product_cap_named({ name: u.name });
      }
      const reasonToMessage: Record<typeof res.reason, string> = {
        license_not_found: m.licenses_assign_error_license_not_found(),
        user_not_found: m.licenses_assign_error_user_not_found(),
        license_at_capacity: m.licenses_assign_error_license_at_capacity(),
        user_at_product_cap: userAtCapMsg,
      };
      return message(form, reasonToMessage[res.reason], { status: 409 });
    }
    const [licInfo] = await db
      .select({
        licenseKey: license.key,
        productId: product.id,
        productName: product.name,
      })
      .from(license)
      .innerJoin(product, eq(license.productId, product.id))
      .where(eq(license.id, form.data.licenseId));

    await createAuditLog(event, {
      action: "license.user_assigned",
      entityType: "license",
      entityId: form.data.licenseId,
      metadata: {
        targetUserId: form.data.userId,
        productId: licInfo?.productId,
        productName: licInfo?.productName,
        licenseKey: licInfo?.licenseKey,
      },
    });
    return { form };
  },

  unassignUser: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(unassignLicenseUserSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const [licInfo] = await db
        .select({
          licenseKey: license.key,
          productId: product.id,
          productName: product.name,
        })
        .from(license)
        .innerJoin(product, eq(license.productId, product.id))
        .where(eq(license.id, form.data.licenseId));

      await unassignUserFromLicense(form.data.licenseId, form.data.userId);
      await createAuditLog(event, {
        action: "license.user_unassigned",
        entityType: "license",
        entityId: form.data.licenseId,
        metadata: {
          targetUserId: form.data.userId,
          productId: licInfo?.productId,
          productName: licInfo?.productName,
          licenseKey: licInfo?.licenseKey,
        },
      });
      return { form };
    } catch (error) {
      console.error("Error unassigning user:", error);
      return message(form, "Failed to unassign user", { status: 500 });
    }
  },
};
