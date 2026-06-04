import { desc, eq } from "drizzle-orm";

import { requireAuthenticatedUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = requireAuthenticatedUser(event);

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
      .where(eq(licenseRequest.userId, user.id))
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
      .where(eq(licenseUser.userId, user.id)),
  ]);

  const assignmentByProduct = new Map(assignments.map((a) => [a.productId, a.licenceKey]));
  const requestedProductIds = new Set(requests.map((r) => r.productId));

  const history = [
    ...requests.map((r) => ({
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

  return { history };
};
