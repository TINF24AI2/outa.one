import type { RequestEvent } from "@sveltejs/kit";

import type { CreateAuditLogOptions } from "$lib/audit";
import { db } from "$lib/server/db";
import { auditLog } from "$lib/server/db/schema";

export type { AuditAction, AuditEntityType, CreateAuditLogOptions } from "$lib/audit";

export async function createAuditLog(
  event: Pick<RequestEvent, "locals" | "request" | "getClientAddress">,
  options: CreateAuditLogOptions,
): Promise<void> {
  try {
    const actor = event.locals.user;
    let ipAddress: string | null = null;
    try {
      ipAddress = event.getClientAddress();
    } catch {
      // not available in all environments (e.g. prerendering)
    }

    await db.insert(auditLog).values({
      userId: actor?.id ?? null,
      userName: actor?.name ?? actor?.email ?? "unknown",
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId ?? null,
      metadata: options.metadata ?? null,
      ipAddress,
      userAgent: event.request.headers.get("user-agent"),
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err);
  }
}
