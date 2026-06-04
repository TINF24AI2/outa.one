import { desc, eq } from "drizzle-orm";

import { db } from "$lib/server/db";
import { license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";

export async function getUserLicenseHistory(userId: string) {
  const [requests, assignments] = await Promise.all([
    db
      .select({
        id: licenseRequest.id,
        productName: product.name,
        productId: licenseRequest.productId,
        status: licenseRequest.status,
        requestedAt: licenseRequest.createdAt,
        rejectionReason: licenseRequest.rejectionReason,
      })
      .from(licenseRequest)
      .innerJoin(product, eq(licenseRequest.productId, product.id))
      .where(eq(licenseRequest.userId, userId))
      .orderBy(desc(licenseRequest.createdAt)),
    db
      .select({
        licenseId: licenseUser.licenseId,
        licenceKey: license.key,
        productName: product.name,
        productId: license.productId,
        assignedAt: licenseUser.createdAt,
      })
      .from(licenseUser)
      .innerJoin(license, eq(licenseUser.licenseId, license.id))
      .innerJoin(product, eq(license.productId, product.id))
      .where(eq(licenseUser.userId, userId)),
  ]);

  const assignmentByProduct = new Map(assignments.map((a) => [a.productId, a.licenceKey]));
  const requestedProductIds = new Set(requests.map((r) => r.productId));

  return [
    ...requests
      .filter((r) => r.status !== "approved" || assignmentByProduct.has(r.productId))
      .map((r) => ({
        id: r.id,
        productName: r.productName,
        licenceKey: assignmentByProduct.get(r.productId) ?? null,
        requestedAt: r.requestedAt,
        status: r.status,
        rejectionReason: r.rejectionReason,
      })),
    ...assignments
      .filter((a) => !requestedProductIds.has(a.productId))
      .map((a) => ({
        id: a.licenseId,
        productName: a.productName,
        licenceKey: a.licenceKey,
        requestedAt: a.assignedAt,
        status: "active" as const,
        rejectionReason: null,
      })),
  ].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}
