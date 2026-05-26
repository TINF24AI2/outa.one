import { and, count, desc, eq, type SQL } from "drizzle-orm";

import { requireAdminUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { auditLog } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 50;

export const load: PageServerLoad = async (event) => {
  requireAdminUser(event);

  const pageParam = Number(event.url.searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const actionFilter = event.url.searchParams.get("action") ?? null;
  const entityTypeFilter = event.url.searchParams.get("entityType") ?? null;

  const conditions: SQL[] = [];
  if (actionFilter) conditions.push(eq(auditLog.action, actionFilter));
  if (entityTypeFilter) conditions.push(eq(auditLog.entityType, entityTypeFilter));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(auditLog).where(where).orderBy(desc(auditLog.createdAt)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(auditLog).where(where),
  ]);

  return {
    logs: rows,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
    filters: {
      action: actionFilter,
      entityType: entityTypeFilter,
    },
  };
};
