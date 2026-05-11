import { fail, type Actions } from "@sveltejs/kit";

import { createLicenseSchema } from "$lib/schemas/licenses";
import type { CreateLicenseInput } from "$lib/schemas/licenses";
import { db } from "$lib/server/db";
import { license, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const products = await db.select({ id: product.id, name: product.name }).from(product);
  return { products };
};

export const actions: Actions = {
  createLicense: async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;
    const result = createLicenseSchema.safeParse(data);

    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        data,
      });
    }

    try {
      await db.insert(license).values(result.data);
      return { success: true };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "23505") {
        const errors: Record<keyof CreateLicenseInput, string[] | undefined> = {
          productId: undefined,
          key: ["This key already exists for the selected product"],
          usageVolume: undefined,
        };
        return fail(409, { errors, data });
      }
      console.error("Error creating license:", error);
      return fail(500, { message: "Failed to create license" });
    }
  },
};
