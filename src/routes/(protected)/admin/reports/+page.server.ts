import { and, count, desc, eq, gte, ilike, inArray, lte, sql, type SQL } from "drizzle-orm";

import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { auditLog, license, product } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 50;

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const pageParam = Number(event.url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const productId = event.url.searchParams.get("productId") ?? null;
  const userSearch = event.url.searchParams.get("userSearch") ?? null;
  const dateFrom = event.url.searchParams.get("dateFrom") ?? null;
  const dateTo = event.url.searchParams.get("dateTo") ?? null;

  // Chart: license assignments per product (all time)
  // entityId is text, license.id is uuid — requires explicit ::uuid cast in join
  const chartRows = await db
    .select({ productName: product.name, count: count() })
    .from(auditLog)
    .innerJoin(license, and(sql`${auditLog.entityId}::uuid = ${license.id}`, eq(auditLog.entityType, "license")))
    .innerJoin(product, eq(license.productId, product.id))
    .where(eq(auditLog.action, "license.user_assigned"))
    .groupBy(product.name)
    .orderBy(desc(count()));

  // Activity log filters
  const conditions: SQL[] = [];
  if (dateFrom) {
    conditions.push(gte(auditLog.createdAt, new Date(dateFrom)));
  }
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLog.createdAt, toDate));
  }
  if (userSearch) {
    conditions.push(ilike(auditLog.userName, `%${userSearch}%`));
  }

  // Sub-filter by product via joining license → product
  // We first get matching licenseIds for the product filter, then filter audit log
  let productName: string | null = null;
  let matchingLicenseIds: string[] = [];
  if (productId) {
    const [prod] = await db.select({ name: product.name }).from(product).where(eq(product.id, productId));
    productName = prod?.name ?? null;

    const licenseRows = await db.select({ id: license.id }).from(license).where(eq(license.productId, productId));
    matchingLicenseIds = licenseRows.map((r) => r.id);
  }

  const offset = (page - 1) * PAGE_SIZE;
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // For product filter, we post-filter after join in JS (simpler than dynamic SQL IN clause)
  const [allRows, [{ total: totalCount }]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        createdAt: auditLog.createdAt,
        userName: auditLog.userName,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
      })
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.createdAt))
      .limit(productId ? 1000 : PAGE_SIZE)
      .offset(productId ? 0 : offset),
    db.select({ total: count() }).from(auditLog).where(where),
  ]);

  // Enrich with product/license info
  const licenseEntityIds = [
    ...new Set(allRows.filter((r) => r.entityType === "license" && r.entityId).map((r) => r.entityId!)),
  ];

  const licenseDetails =
    licenseEntityIds.length > 0
      ? await db
          .select({
            id: license.id,
            key: license.key,
            productId: license.productId,
            productName: product.name,
          })
          .from(license)
          .leftJoin(product, eq(license.productId, product.id))
          .where(inArray(license.id, licenseEntityIds))
      : [];

  const licenseMap = new Map(licenseDetails.map((l) => [l.id, l]));

  let enrichedRows = allRows.map((row) => {
    const lic = row.entityType === "license" && row.entityId ? licenseMap.get(row.entityId) : undefined;
    return {
      ...row,
      licenseKey: lic?.key ?? null,
      productName: lic?.productName ?? null,
      productId: lic?.productId ?? null,
    };
  });

  // Apply product filter post-join
  if (productId && matchingLicenseIds.length > 0) {
    const licenseIdSet = new Set(matchingLicenseIds);
    enrichedRows = enrichedRows.filter((r) => r.entityId && licenseIdSet.has(r.entityId));
  } else if (productId && matchingLicenseIds.length === 0) {
    enrichedRows = [];
  }

  // Paginate post-filter when product filter active
  const filteredTotal = productId ? enrichedRows.length : Number(totalCount);
  const paginatedRows = productId ? enrichedRows.slice(offset, offset + PAGE_SIZE) : enrichedRows;

  // All products for filter dropdown
  const products = await db.select({ id: product.id, name: product.name }).from(product).orderBy(product.name);

  return {
    logs: paginatedRows,
    chartData: chartRows,
    products,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: filteredTotal,
      totalPages: Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE)),
    },
    filters: { productId, userSearch, dateFrom, dateTo, productName },
  };
};
