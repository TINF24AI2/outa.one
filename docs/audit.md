# Audit Log

The audit log records every significant action taken in the application. It is append-only — rows are never updated or deleted.

---

## Table

**DB table:** `audit_log`  
**Schema:** `src/lib/server/db/schema.ts`

| Column       | Type      | Notes                                                       |
| ------------ | --------- | ----------------------------------------------------------- |
| `id`         | uuid      | PK, random                                                  |
| `userId`     | text      | FK → `user.id` (nullable, set null when user is deleted)    |
| `userName`   | text      | Denormalised name/email — readable even after user deletion |
| `action`     | text      | Action type string (see below)                              |
| `entityType` | text      | Type of the affected resource                               |
| `entityId`   | text      | UUID of the affected row (nullable)                         |
| `metadata`   | jsonb     | Action-specific extra data                                  |
| `ipAddress`  | text      | Client IP (may be null in some environments)                |
| `userAgent`  | text      | Browser user agent                                          |
| `created_at` | timestamp | When the action occurred                                    |

Indexes: `userId`, `action`, `entityType`, `createdAt` — supports fast filtering on the audit page.

`userName` is denormalised intentionally: if a user is removed, their past audit entries remain readable by name rather than showing a blank.

---

## Writing audit logs

**Server module:** `src/lib/server/audit.ts`

```ts
import { createAuditLog } from "$lib/server/audit";

await createAuditLog(event, {
  action: "product.created",
  entityType: "product",
  entityId: newProduct.id,
  metadata: { name: newProduct.name },
});
```

`createAuditLog` automatically extracts `userId`, `userName`, `ipAddress`, and `userAgent` from the `RequestEvent`. It never throws — errors are caught and logged to console so a failed audit write never blocks the actual operation.

**Type definitions:** `src/lib/audit.ts` (shared between server and client)

---

## Action types

### License actions

| Action                    | Trigger                                          | `entityType` | Key metadata                                             |
| ------------------------- | ------------------------------------------------ | ------------ | -------------------------------------------------------- |
| `license.created`         | Admin adds a license                             | `license`    | `key`, `productId`, `productName`                        |
| `license.deleted`         | Admin deletes a license                          | `license`    | `key`, `productId`, `productName`                        |
| `license.user_assigned`   | User receives a license (direct or via approval) | `license`    | `targetUserId`, `productId`, `productName`, `licenseKey` |
| `license.user_unassigned` | Admin removes a user from a license              | `license`    | `targetUserId`, `productId`, `productName`               |

### Product actions

| Action            | Trigger                 | `entityType` | Key metadata   |
| ----------------- | ----------------------- | ------------ | -------------- |
| `product.created` | Admin creates a product | `product`    | `name`         |
| `product.updated` | Admin edits a product   | `product`    | changed fields |
| `product.deleted` | Admin deletes a product | `product`    | `name`         |

### User & invite actions

| Action                  | Trigger                     | `entityType` | Key metadata              |
| ----------------------- | --------------------------- | ------------ | ------------------------- |
| `user.invited`          | Admin invites a user        | `invite`     | `email`, `role`           |
| `user.invite_resent`    | Admin resends an invite     | `invite`     | `email`                   |
| `user.invite_cancelled` | Admin cancels an invite     | `invite`     | `email`                   |
| `user.role_updated`     | Admin changes a user's role | `user`       | `targetUserId`, `newRole` |
| `user.removed`          | Admin removes a user        | `user`       | `targetUserId`, `email`   |

### License request actions

| Action                      | Trigger                    | `entityType`      | Key metadata                                             |
| --------------------------- | -------------------------- | ----------------- | -------------------------------------------------------- |
| `license_request.submitted` | Employee submits a request | `license_request` | `targetUserId`, `productId`, `productName`               |
| `license_request.approved`  | Admin approves a request   | `license_request` | `targetUserId`, `productId`, `productName`, `licenseKey` |
| `license_request.rejected`  | Admin rejects a request    | `license_request` | `targetUserId`, `productId`, `productName`, `reason`     |

---

## Querying the audit log

### Admin UI

The `/admin/audit` page provides filters for:

- Product
- User name search
- Date range
- Action type

### Export

`GET /admin/reports/export.csv` exports filtered audit rows as CSV. See [api.md](api.md) for query parameters.

### Direct query example

```ts
import { desc, eq } from "drizzle-orm";

import { db } from "$lib/server/db";
import { auditLog } from "$lib/server/db/schema";

const logs = await db
  .select()
  .from(auditLog)
  .where(eq(auditLog.userId, someUserId))
  .orderBy(desc(auditLog.createdAt))
  .limit(50);
```

---

## Employee history view

Employees can see their own audit history at `/license-history`. This shows only events where `auditLog.userId = event.locals.user.id` — employees cannot see other users' events.
