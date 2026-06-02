import { countDistinct, eq, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { license, licenseRequest, licenseUser, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [totalLicenses, totalProducts, licensesInUse, availableLicenses, pendingRequests] = await Promise.all([
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
  ]);

  return { totalLicenses, totalProducts, licensesInUse, availableLicenses, pendingRequests };
};
