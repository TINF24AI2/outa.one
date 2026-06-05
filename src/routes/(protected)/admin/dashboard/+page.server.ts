import { countDistinct, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { auditLog, license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [totalLicenses, totalProducts, licensesInUse, availableLicenses, pendingRequests, recentActivityRows] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(license)
        .then(([r]) => r.count),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(product)
        .then(([r]) => r.count),
      db
        .select({ count: countDistinct(licenseUser.licenseId) })
        .from(licenseUser)
        .then(([r]) => r.count),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(license)
        .leftJoin(licenseUser, sql`${licenseUser.licenseId} = ${license.id}`)
        .groupBy(license.id, license.usageVolume)
        .having(sql`${license.usageVolume} = 0 OR count(${licenseUser.licenseId})::int < ${license.usageVolume}`)
        .then((rows) => rows.length),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(licenseRequest)
        .where(eq(licenseRequest.status, "pending"))
        .then(([r]) => r.count),
      db
        .select({
          id: auditLog.id,
          createdAt: auditLog.createdAt,
          userName: auditLog.userName,
          entityId: auditLog.entityId,
        })
        .from(auditLog)
        .where(eq(auditLog.action, "license.user_assigned"))
        .orderBy(desc(auditLog.createdAt))
        .limit(5),
    ]);

  // Enrich activity with product names
  const licenseIds = [...new Set(recentActivityRows.filter((r) => r.entityId).map((r) => r.entityId!))];

  const licenseDetails =
    licenseIds.length > 0
      ? await db
          .select({ id: license.id, productName: product.name })
          .from(license)
          .leftJoin(product, eq(license.productId, product.id))
          .where(inArray(license.id, licenseIds))
      : [];

  const licenseMap = new Map(licenseDetails.map((l) => [l.id, l.productName]));

  const recentActivity = recentActivityRows.map((row) => ({
    ...row,
    productName: row.entityId ? (licenseMap.get(row.entityId) ?? null) : null,
  }));

  return { totalLicenses, totalProducts, licensesInUse, availableLicenses, pendingRequests, recentActivity };
};
