import { fail, type Actions } from "@sveltejs/kit";
import { and, eq, gt, sql } from "drizzle-orm";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { approveRequestSchema, rejectRequestSchema } from "$lib/schemas/admin-requests";
import { createAuditLog } from "$lib/server/audit";
import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, licenseRequest, licenseUser, product, user } from "$lib/server/db/schema";
import { licenseApprovedEmail, licenseRejectedEmail } from "$lib/server/email-templates";
import { assignUserToLicense } from "$lib/server/licenses";
import { sendEmail } from "$lib/server/mail";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const requests = await db
    .select({
      id: licenseRequest.id,
      createdAt: licenseRequest.createdAt,
      updatedAt: licenseRequest.updatedAt,
      status: licenseRequest.status,

      userId: user.id,
      userName: user.name,
      email: user.email,

      productId: product.id,
      productName: product.name,

      totalUsage: sql<number>`coalesce(sum(${license.usageVolume}), 0)::int`,
      assignedUsage: sql<number>`count(${licenseUser.userId})::int`,
      availableUsage: sql<number>`greatest(coalesce(sum(${license.usageVolume}), 0) - count(${licenseUser.userId}), 0)::int`,
    })
    .from(licenseRequest)
    .innerJoin(user, eq(licenseRequest.userId, user.id))
    .innerJoin(product, eq(licenseRequest.productId, product.id))
    .leftJoin(license, eq(product.id, license.productId))
    .leftJoin(licenseUser, eq(license.id, licenseUser.licenseId))
    .where(eq(licenseRequest.status, "pending"))
    .groupBy(
      licenseRequest.id,
      licenseRequest.createdAt,
      licenseRequest.updatedAt,
      licenseRequest.status,
      user.id,
      user.name,
      user.email,
      product.id,
      product.name,
    )
    .orderBy(licenseRequest.createdAt);

  const approveForms = await Promise.all(
    requests.map((r) => superValidate({ requestId: r.id }, zod(approveRequestSchema), { id: `approve-${r.id}` })),
  );

  const rejectForms = await Promise.all(
    requests.map((r) => superValidate({ requestId: r.id }, zod(rejectRequestSchema), { id: `reject-${r.id}` })),
  );

  return { requests, approveForms, rejectForms };
};

export const actions: Actions = {
  approve: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(approveRequestSchema));
    if (!form.valid) return fail(400, { form });

    const [request] = await db
      .select({
        id: licenseRequest.id,
        userId: licenseRequest.userId,
        productId: licenseRequest.productId,
        status: licenseRequest.status,
        userName: user.name,
        userEmail: user.email,
        productName: product.name,
      })
      .from(licenseRequest)
      .innerJoin(user, eq(licenseRequest.userId, user.id))
      .innerJoin(product, eq(licenseRequest.productId, product.id))
      .where(eq(licenseRequest.id, form.data.requestId));

    if (!request) return message(form, "Request not found", { status: 404 });
    if (request.status !== "pending") return message(form, "Request is no longer pending", { status: 400 });

    // Find a license for this product with available capacity
    const [availableLicense] = await db
      .select({ id: license.id })
      .from(license)
      .leftJoin(licenseUser, eq(license.id, licenseUser.licenseId))
      .where(eq(license.productId, request.productId))
      .groupBy(license.id)
      .having(gt(sql`${license.usageVolume} - count(${licenseUser.userId})`, 0))
      .limit(1);

    if (!availableLicense) return message(form, "No available license slots for this product", { status: 409 });

    const assignResult = await assignUserToLicense(availableLicense.id, request.userId);
    if (!assignResult.ok) {
      return message(form, "No available license slots for this product", { status: 409 });
    }

    await db.update(licenseRequest).set({ status: "approved" }).where(eq(licenseRequest.id, form.data.requestId));

    const result = { userName: request.userName, userEmail: request.userEmail, productName: request.productName };

    await createAuditLog(event, {
      action: "license_request.approved",
      entityType: "license_request",
      entityId: form.data.requestId,
    });

    await sendEmail({
      to: result.userEmail,
      subject: `Your ${result.productName} license has been approved`,
      html: licenseApprovedEmail(result.userName, result.productName),
    });

    return { form };
  },

  reject: async (event) => {
    requireAdminUser(event);
    const form = await superValidate(event.request, zod(rejectRequestSchema));
    if (!form.valid) return fail(400, { form });

    const [request] = await db
      .select({
        id: licenseRequest.id,
        status: licenseRequest.status,
        userName: user.name,
        userEmail: user.email,
        productName: product.name,
      })
      .from(licenseRequest)
      .innerJoin(user, eq(licenseRequest.userId, user.id))
      .innerJoin(product, eq(licenseRequest.productId, product.id))
      .where(and(eq(licenseRequest.id, form.data.requestId), eq(licenseRequest.status, "pending")));

    if (!request) {
      return message(form, "Request not found or no longer pending", { status: 404 });
    }

    await db
      .update(licenseRequest)
      .set({ status: "rejected", rejectionReason: form.data.reason ?? null })
      .where(eq(licenseRequest.id, form.data.requestId));

    await createAuditLog(event, {
      action: "license_request.rejected",
      entityType: "license_request",
      entityId: form.data.requestId,
      metadata: { reason: form.data.reason },
    });

    await sendEmail({
      to: request.userEmail,
      subject: `Your ${request.productName} license request was not approved`,
      html: licenseRejectedEmail(request.userName, request.productName, form.data.reason),
    });

    return { form };
  },
};
