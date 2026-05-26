export type AuditAction =
  | "license.created"
  | "license.deleted"
  | "license.user_assigned"
  | "license.user_unassigned"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "user.invited"
  | "user.invite_resent"
  | "user.invite_cancelled"
  | "user.role_updated"
  | "user.removed"
  | "license_request.submitted";

export type AuditEntityType = "license" | "product" | "user" | "invite" | "license_request";

export interface CreateAuditLogOptions {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export const AUDIT_ACTIONS: AuditAction[] = [
  "license.created",
  "license.deleted",
  "license.user_assigned",
  "license.user_unassigned",
  "product.created",
  "product.updated",
  "product.deleted",
  "user.invited",
  "user.invite_resent",
  "user.invite_cancelled",
  "user.role_updated",
  "user.removed",
  "license_request.submitted",
];

export const AUDIT_ENTITY_TYPES: AuditEntityType[] = ["license", "product", "user", "invite", "license_request"];
