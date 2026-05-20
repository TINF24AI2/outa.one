import { countDistinct, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { license, licenseUser, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [totalLicenses, totalProducts, licensesInUse, availableLicenses] = await Promise.all([
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
  ]);

  return { totalLicenses, totalProducts, licensesInUse, availableLicenses };
};
