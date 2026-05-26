import { fail, type Actions } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { m } from "$lib/paraglide/messages.js";
import { createProductSchema, deleteProductSchema, updateProductSchema } from "$lib/schemas/products";
import { createAuditLog } from "$lib/server/audit";
import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, licenseUser, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const [products, licenseTotals, assignedTotals] = await Promise.all([
    db
      .select({
        id: product.id,
        name: product.name,
        description: product.description,
        requiresApproval: product.requiresApproval,
        maxLicensesPerUser: product.maxLicensesPerUser,
      })
      .from(product)
      .orderBy(product.name),
    db
      .select({
        productId: license.productId,
        licenseCount: sql<number>`count(*)::int`,
        totalSeats: sql<number>`coalesce(sum(${license.usageVolume}), 0)::int`,
        maxUsageVolume: sql<number>`coalesce(max(${license.usageVolume}), 0)::int`,
      })
      .from(license)
      .groupBy(license.productId),
    db
      .select({
        productId: license.productId,
        assignedSeats: sql<number>`count(*)::int`,
      })
      .from(licenseUser)
      .innerJoin(license, eq(licenseUser.licenseId, license.id))
      .groupBy(license.productId),
  ]);

  const licenseTotalsByProduct = Object.fromEntries(licenseTotals.map((row) => [row.productId, row]));
  const assignedTotalsByProduct = Object.fromEntries(assignedTotals.map((row) => [row.productId, row.assignedSeats]));

  const enrichedProducts = products.map((currentProduct) => {
    const totals = licenseTotalsByProduct[currentProduct.id];
    const totalSeats = totals?.totalSeats ?? 0;
    const assignedSeats = assignedTotalsByProduct[currentProduct.id] ?? 0;

    return {
      ...currentProduct,
      licenseCount: totals?.licenseCount ?? 0,
      maxUsageVolume: totals?.maxUsageVolume ?? 0,
      totalSeats,
      assignedSeats,
      availableSeats: Math.max(0, totalSeats - assignedSeats),
    };
  });

  const editForms = await Promise.all(
    enrichedProducts.map((currentProduct) =>
      superValidate(
        {
          productId: currentProduct.id,
          name: currentProduct.name,
          description: currentProduct.description,
          maxLicensesPerUser: currentProduct.maxLicensesPerUser,
          requiresApproval: currentProduct.requiresApproval,
        },
        zod(updateProductSchema),
        { id: `update-product-${currentProduct.id}` },
      ),
    ),
  );

  const deleteForms = await Promise.all(
    enrichedProducts.map((currentProduct) =>
      superValidate({ productId: currentProduct.id }, zod(deleteProductSchema), {
        id: `delete-product-${currentProduct.id}`,
      }),
    ),
  );

  return {
    form: await superValidate({ maxLicensesPerUser: 1 }, zod(createProductSchema), {
      id: "create-product",
      errors: false,
    }),
    products: enrichedProducts,
    editForms,
    deleteForms,
  };
};

export const actions: Actions = {
  createProduct: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(createProductSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const [inserted] = await db.insert(product).values(form.data).returning({ id: product.id });
      await createAuditLog(event, {
        action: "product.created",
        entityType: "product",
        entityId: inserted?.id,
        metadata: { name: form.data.name },
      });
      return { form };
    } catch (error) {
      console.error("Error creating product:", error);
      return message(form, m.products_error_create_failed(), { status: 500 });
    }
  },

  updateProduct: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(updateProductSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const [updatedProduct] = await db
        .update(product)
        .set({
          name: form.data.name,
          description: form.data.description,
          maxLicensesPerUser: form.data.maxLicensesPerUser,
          requiresApproval: form.data.requiresApproval,
        })
        .where(eq(product.id, form.data.productId))
        .returning({ id: product.id });

      if (!updatedProduct) {
        return message(form, m.products_error_not_found(), { status: 404 });
      }

      await createAuditLog(event, {
        action: "product.updated",
        entityType: "product",
        entityId: updatedProduct.id,
        metadata: { name: form.data.name },
      });
      return { form };
    } catch (error) {
      console.error("Error updating product:", error);
      return message(form, m.products_error_update_failed(), { status: 500 });
    }
  },

  deleteProduct: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(deleteProductSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const [deletedProduct] = await db
        .delete(product)
        .where(eq(product.id, form.data.productId))
        .returning({ id: product.id });

      if (!deletedProduct) {
        return message(form, m.products_error_not_found(), { status: 404 });
      }

      await createAuditLog(event, { action: "product.deleted", entityType: "product", entityId: deletedProduct.id });
      return { form };
    } catch (error) {
      console.error("Error deleting product:", error);
      return message(form, m.products_error_delete_failed(), { status: 500 });
    }
  },
};
