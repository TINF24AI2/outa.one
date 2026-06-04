import { desc, eq, or, sql } from "drizzle-orm";

import { db } from "$lib/server/db";
import { auditLog } from "$lib/server/db/schema";

/**
 * Retrieves the complete license history for a specific user from the audit logs.
 * Includes actions performed by the user (requests) and actions performed on the user (admin assignments/approvals).
 */
export async function getUserLicenseHistory(userId: string) {
  const logs = await db
    .select()
    .from(auditLog)
    .where(or(eq(auditLog.userId, userId), sql`${auditLog.metadata}->>'targetUserId' = ${userId}`))
    .orderBy(desc(auditLog.createdAt));

  return logs.map((log) => {
    const metadata = log.metadata as Record<string, unknown> | null;
    return {
      ...log,
      ...metadata,
    };
  });
}
