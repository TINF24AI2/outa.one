import { fail, type Actions } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { assignLicenseUserSchema, createLicenseSchema, unassignLicenseUserSchema } from "$lib/schemas/licenses";
import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, product } from "$lib/server/db/schema";
import { assignUserToLicense, unassignUserFromLicense } from "$lib/server/licenses";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const products = await db.select({ id: product.id, name: product.name }).from(product);
  return {
    products,
    form: await superValidate({ usageVolume: 1 }, zod(createLicenseSchema), { id: "create-license", errors: false }),
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
