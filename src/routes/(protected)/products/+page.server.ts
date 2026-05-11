import { fail, type Actions } from "@sveltejs/kit";

import { createProductSchema } from "$lib/schemas/products";
import { db } from "$lib/server/db";
import { product } from "$lib/server/db/schema";

export const actions: Actions = {
  createProduct: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;
    const result = createProductSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data,
      });
    }

    try {
      await db.insert(product).values(result.data);
      return { success: true };
    } catch (error) {
      console.error("Error creating product:", error);
      return fail(500, { message: "Failed to create product" });
    }
  },
};
