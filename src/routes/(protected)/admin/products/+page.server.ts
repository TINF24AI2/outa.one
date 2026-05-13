import { fail, type Actions } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { createProductSchema } from "$lib/schemas/products";
import { db } from "$lib/server/db";
import { product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    form: await superValidate({ maxLicensesPerUser: 1 }, zod(createProductSchema), {
      id: "create-product",
      errors: false,
    }),
  };
};

export const actions: Actions = {
  createProduct: async ({ request }) => {
    const form = await superValidate(request, zod(createProductSchema));
    if (!form.valid) return fail(400, { form });

    try {
      await db.insert(product).values(form.data);
      return { form };
    } catch (error) {
      console.error("Error creating product:", error);
      return message(form, "Failed to create product", { status: 500 });
    }
  },
};
