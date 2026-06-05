import { and, desc, eq, gte, ilike, inArray, lte, type SQL } from "drizzle-orm";

import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { auditLog, license, product } from "$lib/server/db/schema";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  requireAdminUser(event);

  const productId = event.url.searchParams.get("productId") ?? null;
  const userSearch = event.url.searchParams.get("userSearch") ?? null;
  const dateFrom = event.url.searchParams.get("dateFrom") ?? null;
  const dateTo = event.url.searchParams.get("dateTo") ?? null;

  const conditions: SQL[] = [];
  if (dateFrom) conditions.push(gte(auditLog.createdAt, new Date(dateFrom)));
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLog.createdAt, toDate));
  }
  if (userSearch) conditions.push(ilike(auditLog.userName, `%${userSearch}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
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
    .limit(10000);

  const licenseEntityIds = [
    ...new Set(rows.filter((r) => r.entityType === "license" && r.entityId).map((r) => r.entityId!)),
  ];

  const licenseDetails =
    licenseEntityIds.length > 0
      ? await db
          .select({ id: license.id, key: license.key, productName: product.name, productId: license.productId })
          .from(license)
          .leftJoin(product, eq(license.productId, product.id))
          .where(inArray(license.id, licenseEntityIds))
      : [];

  const licenseMap = new Map(licenseDetails.map((l) => [l.id, l]));

  let enriched = rows.map((row) => {
    const lic = row.entityType === "license" && row.entityId ? licenseMap.get(row.entityId) : undefined;
    return {
      ...row,
      licenseKey: lic?.key ?? "",
      productName: lic?.productName ?? "",
      licenseProductId: lic?.productId ?? "",
    };
  });

  if (productId) {
    const licenseRows = await db.select({ id: license.id }).from(license).where(eq(license.productId, productId));
    const ids = new Set(licenseRows.map((r) => r.id));
    enriched = enriched.filter((r) => r.entityId && ids.has(r.entityId));
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const headers = ["Timestamp", "User", "Product", "License Key", "Action", "Entity Type", "Entity ID"];
  const csvLines = [
    headers.join(","),
    ...enriched.map((r) =>
      [
        escape(r.createdAt.toISOString()),
        escape(r.userName),
        escape(r.productName),
        escape(r.licenseKey),
        escape(r.action),
        escape(r.entityType),
        escape(r.entityId ?? ""),
      ].join(","),
    ),
  ];

  const csv = csvLines.join("\r\n");
  const filename = `license-activity-${new Date().toISOString().split("T")[0]}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
