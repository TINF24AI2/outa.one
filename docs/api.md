# Routes & Server API

This document describes every SvelteKit route: what data it loads, what actions it exposes, and what HTTP endpoints exist.

All routes are in `src/routes/`. SvelteKit uses file-based routing. Load functions run on the server and return data to the page. Form actions accept `POST` requests.

---

## Public Routes

### `GET /`

**File:** `src/routes/+page.svelte` / `+page.server.ts`

Landing page. Redirects authenticated users to `/request`.

---

## Auth Routes (`src/routes/(auth)/`)

All auth routes redirect to `/request` if the user is already logged in (`redirectAuthenticated`).

### `GET/POST /login`

**Load** — queries DB for demo user existence; returns `hasDemoUsers: boolean`.

**Action: `default`**

- Validates `email` + `password`
- Calls `auth.api.signInEmail`
- On success: `redirect(302, '/request')`
- On `APIError`: `fail(400, { fieldErrors })`

---

### `GET/POST /signup?token=<uuid>`

**Load** — validates the invite token via `getValidInvite(token)`. Returns `{ token, email }` on valid token, or `{ error: 'no_invite' | 'invalid_invite' }`.

**Action: `default`**

- Re-validates the token
- Validates name, email, password (≥ 8 chars), confirmPassword
- Calls `auth.api.signUpEmail`
- If `invite.role === 'admin'`: sets `user.role = 'admin'`
- Calls `consumeInvite(token)`
- `redirect(302, '/signup/success')`

---

### `GET/POST /forgot-password`

**Load** — redirects authenticated users.

**Action: `default`**

- Validates email format
- Calls `auth.api.requestPasswordReset({ body: { email, redirectTo: origin + '/reset-password' } })`
- Always returns `{ success: true, email }` (prevents email enumeration)

---

### `GET/POST /reset-password?token=<token>`

**Load** — reads `token` from URL; redirects to `/forgot-password` if absent.

**Action: `default`**

- Validates password ≥ 8 chars + match
- Calls `auth.api.resetPassword({ body: { token, newPassword } })`
- On `APIError`: `fail(400, { message })`
- On success: `{ success: true }`

---

## Employee Routes (`src/routes/(protected)/(employee)/`)

All routes require an authenticated user (`requireAuthenticatedUser`).

### `GET /request`

**Load**

- Loads all products, licenses, and user assignments in parallel
- Computes per-product availability and how many licenses the current user holds
- Returns `{ products: ProductItem[], form }`

**Action: `requestLicense`**

- Validates `productId` (Zod schema)
- If `product.requiresApproval`:
  - Checks for existing pending request for this product
  - Inserts `licenseRequest { status: 'pending' }`
  - Creates audit log: `license_request.submitted`
  - Emails all non-demo admins (notification)
  - Returns `{ form, pending: true, productName }`
- If no approval needed:
  - Tries `assignUserToLicense` for each available license until one succeeds
  - Creates audit log: `license.user_assigned`
  - Returns `{ form, licenseKey, productName }`
- On capacity error: `message(form, ..., { status: 409 })`

---

### `GET /my-licenses`

**Load**

- Queries `licenseUser` joined with `license` and `product` for the current user
- Returns the user's assigned licenses with product names and keys

---

### `GET /license-history`

**Load**

- Queries `audit_log` filtered by `userId = event.locals.user.id`
- Returns the user's own action history

---

## Admin Routes (`src/routes/(protected)/admin/`)

All routes require `user.role === 'admin'` (`requireAdminUser`).

### `GET /admin/dashboard`

**Load**

- Counts: total users, total products, total licenses, pending requests
- Returns summary metrics for the dashboard cards

---

### `GET/POST /admin/products`

**Load** — returns all products with their license counts.

**Action: `addProduct`**

- Validates name, description, `requiresApproval`, `maxLicensesPerUser`
- Inserts into `product`
- Creates audit log: `product.created`

**Action: `editProduct`**

- Validates product ID + fields
- Updates `product` row
- Creates audit log: `product.updated`

**Action: `deleteProduct`**

- Validates product ID
- Deletes from `product` (cascades to `license`, `licenseUser`, `licenseRequest`)
- Creates audit log: `product.deleted`

---

### `GET/POST /admin/licenses`

**Load** — returns all licenses joined with their products and current user assignments.

**Action: `addLicense`**

- Validates `key`, `usageVolume`, `productId`
- Inserts into `license`
- Creates audit log: `license.created`

**Action: `deleteLicense`**

- Validates license ID
- Deletes from `license` (cascades to `licenseUser`)
- Creates audit log: `license.deleted`

**Action: `assignUser`**

- Validates `licenseId`, `userId`
- Calls `assignUserToLicense(licenseId, userId)` (transactional)
- Creates audit log: `license.user_assigned`

**Action: `unassignUser`**

- Validates `licenseId`, `userId`
- Calls `unassignUserFromLicense(licenseId, userId)`
- Creates audit log: `license.user_unassigned`

---

### `GET/POST /admin/requests`

**Load**

- Returns all pending `licenseRequest` rows joined with user, product, and computed availability stats (total seats, assigned, available)
- Creates one `approveForm` and one `rejectForm` per request (superforms)

**Action: `approve`**

- Validates `requestId`
- Finds a license for the product with available capacity
- Calls `assignUserToLicense`
- Updates request `status = 'approved'`
- Creates audit log: `license_request.approved`
- Emails the employee (approved + license key)
- On no capacity: `message(form, ..., { status: 409 })`

**Action: `reject`**

- Validates `requestId`, optional `reason`
- Updates request `status = 'rejected'`, sets `rejectionReason`
- Creates audit log: `license_request.rejected`
- Emails the employee (rejected + reason if provided)

---

### `GET/POST /admin/users`

**Load** — calls `listManagedUsers(headers)` which merges active users and pending invites into a unified sorted list.

**Action: `inviteUser`**

- Validates `email`, `role`
- Calls `inviteManagedUser(email, role)` (creates invite + sends email)
- Returns `{ inviteUrl, emailSent }`
- On `ManagedUserError('account_exists')`: `fail(409, ...)`
- Creates audit log: `user.invited`

**Action: `resendInvite`**

- Validates `inviteId`
- Calls `resendManagedInvite(inviteId)`
- Creates audit log: `user.invite_resent`

**Action: `cancelInvite`**

- Validates `inviteId`
- Calls `cancelManagedInvite(inviteId)`
- Creates audit log: `user.invite_cancelled`

**Action: `updateRole`**

- Validates `userId`, `role`
- Calls `updateManagedUserRole(headers, userId, role)`
- On `ManagedUserError('last_admin')`: returns error (cannot remove last admin)
- Creates audit log: `user.role_updated`

**Action: `removeUser`**

- Validates `userId`
- Calls `removeManagedUser(headers, userId, currentUserId)`
- On `ManagedUserError('self_delete')`: returns error
- On `ManagedUserError('last_admin')`: returns error
- Creates audit log: `user.removed`

---

### `GET /admin/audit`

**Load**

- Accepts query params: `productId`, `userSearch`, `dateFrom`, `dateTo`, `actionFilter`
- Returns paginated/filtered `audit_log` rows with enriched license + product details

---

### `GET /admin/reports`

**Load** — same filter params as audit log; returns aggregate stats for the reports page.

---

## REST Endpoints

### `GET /admin/reports/export.csv`

**File:** `src/routes/(protected)/admin/reports/export.csv/+server.ts`

Requires admin. Accepts query params: `productId`, `userSearch`, `dateFrom`, `dateTo`.

Returns a `text/csv` response with `Content-Disposition: attachment`. Columns:

```
Timestamp, User, Product, License Key, Action, Entity Type, Entity ID
```

Up to 10,000 rows, ordered by `createdAt DESC`.

---

### `GET /admin/reports/export.pdf`

**File:** `src/routes/(protected)/admin/reports/export.pdf/+server.ts`

Requires admin. Same filter params as CSV. Returns `application/pdf` using pdfkit.

---

### `POST /api/auth/*`

All Better Auth API routes are handled by `svelteKitHandler` in `hooks.server.ts`. These are internal to Better Auth and not directly called by application code outside of the Better Auth client.
