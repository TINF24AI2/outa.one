import { fail, type Actions } from "@sveltejs/kit";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { createLicenseSchema } from "$lib/schemas/licenses";
import { db } from "$lib/server/db";
import { license, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const products = await db.select({ id: product.id, name: product.name }).from(product);
  return {
    products,
    form: await superValidate({ usageVolume: 1 }, zod(createLicenseSchema), { id: "create-license", errors: false }),
  };
};

export const actions: Actions = {
  createLicense: async ({ request }) => {
    const form = await superValidate(request, zod(createLicenseSchema));
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
};
