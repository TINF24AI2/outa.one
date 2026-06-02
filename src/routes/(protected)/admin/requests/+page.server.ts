import { eq, sql } from "drizzle-orm";

import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { license, licenseRequest, licenseUser, product, user } from "$lib/server/db/schema";

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
  return {
    requests,
  };
};
