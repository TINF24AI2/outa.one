# License Lifecycle

This document describes the full lifecycle of a license: how products and licenses are configured, how employees obtain licenses, how the capacity model works, and how assignments are tracked.

---

## Data model summary

```
product ──< license ──< license_user >── user
   │                                      │
   └──< license_request >────────────────┘
```

- A **product** represents a software title (e.g. "Adobe Photoshop").
- A **license** is a specific license key that belongs to a product. One product can have many license keys.
- A **license_user** row records that a specific user holds a specific license key.
- A **license_request** records a pending/approved/rejected request from an employee for a product.

---

## Product configuration

Products have two settings that control how licenses are distributed:

| Field                | Type    | Meaning                                                                         |
| -------------------- | ------- | ------------------------------------------------------------------------------- |
| `requiresApproval`   | boolean | If `true`, employees must wait for admin approval before receiving a key        |
| `maxLicensesPerUser` | integer | Maximum license keys from this product a single user may hold (`0` = unlimited) |

---

## License capacity

Each license key has a `usageVolume` field:

| Value       | Meaning                                     |
| ----------- | ------------------------------------------- |
| `1`         | Single-seat — only one user can be assigned |
| `N > 1`     | N users may share this key concurrently     |
| `0` or `-1` | Unlimited — no seat cap                     |

The current occupancy of a license is derived by counting rows in `license_user` for that `licenseId`.

**Available seats = `usageVolume - count(license_user rows)`** (when `usageVolume > 0`)

---

## Assignment function

**File:** `src/lib/server/licenses.ts`

`assignUserToLicense(licenseId, userId)` is the authoritative function for adding a user to a license. It runs inside a **database transaction with a `FOR UPDATE` row lock** on the license row to prevent race conditions.

Steps:

1. Lock and fetch the license row.
2. Fetch the user row (existence check).
3. If the user is already assigned → return `{ ok: true }` (idempotent).
4. If `usageVolume > 0`: count current assignments; return `{ ok: false, reason: 'license_at_capacity' }` if full.
5. If `product.maxLicensesPerUser > 0`: count how many licenses from this product the user already holds; return `{ ok: false, reason: 'user_at_product_cap' }` if at limit.
6. Insert into `license_user`.
7. Return `{ ok: true }`.

Possible failure reasons: `license_not_found`, `user_not_found`, `license_at_capacity`, `user_at_product_cap`.

---

## Flow 1: Immediate assignment (no approval)

Used when `product.requiresApproval = false`.

```
Employee → POST /request { productId }
  │
  ├─ load candidates: licenses for product the user doesn't already hold
  │
  ├─ for each candidate license:
  │     assignUserToLicense(licenseId, userId)
  │       ├─ ok → audit log (license.user_assigned) + return licenseKey
  │       ├─ license_at_capacity → try next candidate
  │       └─ user_at_product_cap → return 409 (stop trying)
  │
  └─ if all candidates exhausted → return 409 "no available license slots"
```

The employee sees their license key immediately on success.

---

## Flow 2: Request with approval

Used when `product.requiresApproval = true`.

### Step 1 — Employee submits request

```
Employee → POST /request { productId }
  ├─ check: no existing pending request for this product
  ├─ insert licenseRequest { status: 'pending' }
  ├─ audit log: license_request.submitted
  └─ email all non-demo admins: licenseRequestNotificationEmail(...)
```

The employee sees a "pending" confirmation. They cannot submit a second request for the same product while one is pending.

### Step 2 — Admin reviews

Pending requests appear on `/admin/requests` with computed availability stats (total seats, assigned seats, available seats).

### Step 3a — Admin approves

```
Admin → POST /admin/requests { action: approve, requestId }
  ├─ fetch request row (must be 'pending')
  ├─ find a license for the product with available capacity
  │    (excludes licenses the user already holds)
  ├─ assignUserToLicense(availableLicense.id, userId)
  ├─ update licenseRequest { status: 'approved' }
  ├─ audit log: license_request.approved
  └─ email employee: licenseApprovedEmail(name, product, licenseKey)
```

### Step 3b — Admin rejects

```
Admin → POST /admin/requests { action: reject, requestId, reason? }
  ├─ fetch request row (must be 'pending')
  ├─ update licenseRequest { status: 'rejected', rejectionReason }
  ├─ audit log: license_request.rejected
  └─ email employee: licenseRejectedEmail(name, product, reason?)
```

---

## Admin direct assignment

Admins can assign users to specific license keys directly from `/admin/licenses`, bypassing the request flow. This calls `assignUserToLicense` with the same transaction logic, then writes an audit log entry.

Admins can also unassign users, which deletes the `license_user` row and writes a `license.user_unassigned` audit entry.

---

## Availability calculation (request page)

The `/request` load function computes per-product availability for the UI without using transactions (read-only, eventual consistency is acceptable here):

1. Load all products, all licenses, all `licenseUser` rows, and the current user's `licenseUser` rows in parallel.
2. For each product:
   - Sum available seats across all its licenses (skipping licenses the user already holds).
   - If any license has `usageVolume = 0`, mark available as `-1` (unlimited).
   - Count how many licenses the user already holds for this product (`userHeld`).
3. Return enriched `ProductItem[]` with `available`, `userHeld`, `licenseType`.

`licenseType` is `'volume'` if any license has `usageVolume !== 1`, otherwise `'single'`. This controls what the UI displays.

---

## Viewing assigned licenses

Employees see their licenses at `/my-licenses` — a list of products and the specific key(s) assigned to them, with copy-to-clipboard functionality.

The `license_user.createdAt` timestamp records when each assignment was made.

---

## Cascade behaviour

- Deleting a **product** cascades to all its `license` rows, which cascade to `licenseUser` and `licenseRequest` rows.
- Deleting a **license** cascades to its `licenseUser` rows.
- Deleting a **user** cascades to their `licenseUser` and `licenseRequest` rows. Their `auditLog.userId` is set to `null` (their `userName` is preserved).
