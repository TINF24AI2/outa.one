import { and, eq, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { license, licenseUser, product, user } from "$lib/server/db/schema";

type AssignResult =
  | { ok: true }
  | { ok: false; reason: "license_not_found" | "user_not_found" | "license_at_capacity" | "user_at_product_cap" };

export async function assignUserToLicense(licenseId: string, userId: string): Promise<AssignResult> {
  return await db.transaction(async (tx) => {
    const [lic] = await tx
      .select({ id: license.id, usageVolume: license.usageVolume, productId: license.productId })
      .from(license)
      .where(eq(license.id, licenseId))
      .for("update");
    if (!lic) return { ok: false, reason: "license_not_found" };

    const [u] = await tx.select({ id: user.id }).from(user).where(eq(user.id, userId));
    if (!u) return { ok: false, reason: "user_not_found" };

    if (lic.usageVolume > 0) {
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(licenseUser)
        .where(eq(licenseUser.licenseId, licenseId));
      if (count >= lic.usageVolume) return { ok: false, reason: "license_at_capacity" };
    }

    const [prod] = await tx
      .select({ max: product.maxLicensesPerUser })
      .from(product)
      .where(eq(product.id, lic.productId));
    if (prod.max > 0) {
      const [{ count: userProductCount }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(licenseUser)
        .innerJoin(license, eq(license.id, licenseUser.licenseId))
        .where(and(eq(licenseUser.userId, userId), eq(license.productId, lic.productId)));
      if (userProductCount >= prod.max) return { ok: false, reason: "user_at_product_cap" };
    }

    await tx.insert(licenseUser).values({ licenseId, userId });
    return { ok: true };
  });
}

export async function unassignUserFromLicense(licenseId: string, userId: string): Promise<{ ok: true }> {
  await db.delete(licenseUser).where(and(eq(licenseUser.licenseId, licenseId), eq(licenseUser.userId, userId)));
  return { ok: true };
}
