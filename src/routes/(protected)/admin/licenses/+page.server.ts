import { fail, type Actions } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { assignLicenseUserSchema, createLicenseSchema, deleteLicenseSchema, unassignLicenseUserSchema } from "$lib/schemas/licenses";
import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, product } from "$lib/server/db/schema";
import { assignUserToLicense, unassignUserFromLicense } from "$lib/server/licenses";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const [licenses, products] = await Promise.all([
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
  ]);

  const deleteForms = await Promise.all(
    licenses.map((lic) =>
      superValidate({ licenseId: lic.id }, zod(deleteLicenseSchema), { id: `delete-license-${lic.id}` }),
    ),
  );

  return {
    licenses,
    products,
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
      await db.insert(license).values(form.data);
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
      const reasonToMessage: Record<typeof res.reason, string> = {
        license_not_found: "License not found",
        user_not_found: "User not found",
        license_at_capacity: "License is at capacity",
        user_at_product_cap: "User already has the maximum number of licenses for this product",
      };
      return message(form, reasonToMessage[res.reason], { status: 409 });
    }
    return { form };
  },

  unassignUser: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(unassignLicenseUserSchema));
    if (!form.valid) return fail(400, { form });

    await unassignUserFromLicense(form.data.licenseId, form.data.userId);
    return { form };
  },
};
