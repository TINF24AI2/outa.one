import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

import { requireAuthenticatedUser } from "$lib/server/auth/guards";
import { db } from "$lib/server/db";
import { auditLog } from "$lib/server/db/schema";

import type { PageServerLoad } from "./$types";

const LICENSE_ACTIONS = [
  "license_request.submitted",
  "license_request.approved",
  "license_request.rejected",
  "license.user_assigned",
  "license.user_unassigned",
] as const;

export type LicenseAction = (typeof LICENSE_ACTIONS)[number];

export const load: PageServerLoad = async (event) => {
  const user = requireAuthenticatedUser(event);

  const events = await db
    .select()
    .from(auditLog)
    .where(
      and(
        inArray(auditLog.action, [...LICENSE_ACTIONS]),
        or(eq(auditLog.userId, user.id), sql`${auditLog.metadata}->>'targetUserId' = ${user.id}`),
      ),
    )
    .orderBy(desc(auditLog.createdAt));

  return {
    events: events.map((e) => ({
      id: e.id,
      action: e.action as LicenseAction,
      createdAt: e.createdAt,
      metadata: e.metadata as Record<string, string> | null,
    })),
  };
};
