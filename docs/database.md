# Database

## Stack

- **Database:** PostgreSQL 15+
- **ORM:** Drizzle ORM (type-safe SQL query builder)
- **Migrations:** drizzle-kit, stored in `drizzle/` as plain SQL files
- **Schema source of truth:** `src/lib/server/db/schema.ts` (application tables) + `src/lib/server/db/auth.schema.ts` (auth tables)

Migrations are applied automatically on server startup via the `init` hook in `src/hooks.server.ts`. They can also be run manually with `pnpm db:migrate`.

---

## Table Overview

### Application Tables

| Table             | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `product`         | Software products that can be licensed                              |
| `license`         | Individual license keys belonging to a product                      |
| `license_user`    | Join table: which users are assigned to which licenses              |
| `license_request` | Employee requests for a product license (pending/approved/rejected) |
| `audit_log`       | Append-only log of all significant actions                          |
| `task`            | Internal task table (legacy, not used in main flows)                |

### Auth Tables (managed by Better Auth)

| Table          | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `user`         | All user accounts with name, email, role                      |
| `session`      | Active sessions, keyed by opaque token                        |
| `account`      | Auth provider credentials (only `credential` provider in use) |
| `verification` | Short-lived tokens for email verification / password reset    |
| `invite`       | Pending invite tokens with expiry and role                    |

---

## Table Definitions

### `product`

```
id              uuid        PK, random default
name            text        NOT NULL
description     text        nullable
requiresApproval boolean    NOT NULL, default false
maxLicensesPerUser integer  NOT NULL, default 1  (0 = unlimited)
created_at      timestamp   NOT NULL, default now
updated_at      timestamp   NOT NULL, auto-updated on change
```

- `requiresApproval = true` means employees must wait for admin approval before a license key is assigned.
- `maxLicensesPerUser = 0` means unlimited licenses per user for this product.

---

### `license`

```
id              uuid        PK, random default
key             text        NOT NULL — the actual license key string
usageVolume     integer     NOT NULL — max concurrent users; -1 or 0 = unlimited
productId       uuid        NOT NULL, FK → product.id (cascade delete)
created_at      timestamp   NOT NULL, default now
updated_at      timestamp   NOT NULL, auto-updated on change

UNIQUE (productId, key)
INDEX  license_productId_idx ON (productId)
```

- A `license` belongs to exactly one `product`.
- Multiple users can share a single license if `usageVolume > 1`.
- `usageVolume = 1` is a single-user (seat) license.
- `usageVolume = -1` or `0` means the license has no seat cap.

---

### `license_user`

```
license_id      uuid        NOT NULL, FK → license.id (cascade delete)
user_id         text        NOT NULL, FK → user.id (cascade delete)
created_at      timestamp   NOT NULL, default now

PRIMARY KEY (license_id, user_id)
INDEX  license_user_user_id_idx ON (user_id)
```

This is the pivot table that records which users hold which license keys. `created_at` records when the assignment was made.

---

### `license_request`

```
id              uuid        PK, random default
userId          text        NOT NULL, FK → user.id (cascade delete)
productId       uuid        NOT NULL, FK → product.id (cascade delete)
status          enum        NOT NULL, default 'pending'
                            values: 'pending' | 'approved' | 'rejected'
rejectionReason text        nullable — set when status = 'rejected'
created_at      timestamp   NOT NULL, default now
updated_at      timestamp   NOT NULL, auto-updated on change

INDEX  license_request_user_id_idx ON (userId)
INDEX  license_request_product_id_idx ON (productId)
```

Requests are created when an employee requests a product that has `requiresApproval = true`. Once approved, a `license_user` row is also created.

---

### `audit_log`

```
id              uuid        PK, random default
userId          text        nullable, FK → user.id (set null on delete)
userName        text        NOT NULL — denormalized; survives user deletion
action          text        NOT NULL — see Audit Actions below
entityType      text        NOT NULL — 'license' | 'product' | 'user' | 'invite' | 'license_request'
entityId        text        nullable — UUID of the affected row
metadata        jsonb       nullable — action-specific extra data
ipAddress       text        nullable
userAgent       text        nullable
created_at      timestamp   NOT NULL, default now

INDEX  audit_log_user_id_idx    ON (userId)
INDEX  audit_log_action_idx     ON (action)
INDEX  audit_log_entity_type_idx ON (entityType)
INDEX  audit_log_created_at_idx  ON (created_at)
```

`audit_log` is append-only — rows are never updated or deleted. `userName` is denormalized so historical entries remain readable after a user is removed.

Audit actions: `license.created`, `license.deleted`, `license.user_assigned`, `license.user_unassigned`, `product.created`, `product.updated`, `product.deleted`, `user.invited`, `user.invite_resent`, `user.invite_cancelled`, `user.role_updated`, `user.removed`, `license_request.submitted`, `license_request.approved`, `license_request.rejected`.

See [audit.md](audit.md) for full details.

---

### `user` (Better Auth)

```
id              text        PK (Better Auth string IDs)
name            text        NOT NULL
email           text        NOT NULL, UNIQUE
emailVerified   boolean     NOT NULL, default false
image           text        nullable
role            text        nullable — null or 'user' = employee; 'admin' = admin
banned          boolean     default false
banReason       text        nullable
banExpires      timestamp   nullable
created_at      timestamp
updated_at      timestamp
```

---

### `session` (Better Auth)

```
id              text        PK
token           text        NOT NULL, UNIQUE — value stored in the cookie
userId          text        NOT NULL, FK → user.id (cascade delete)
expiresAt       timestamp   NOT NULL
ipAddress       text        nullable
userAgent       text        nullable
impersonatedBy  text        nullable
created_at / updated_at
```

---

### `account` (Better Auth)

```
id              text        PK
accountId       text        NOT NULL — provider-specific user ID
providerId      text        NOT NULL — always 'credential' in this app
userId          text        NOT NULL, FK → user.id (cascade delete)
password        text        nullable — hashed with Better Auth's crypto
created_at / updated_at
```

---

### `verification` (Better Auth)

Short-lived tokens used for email verification and password reset flows.

```
id              text        PK
identifier      text        NOT NULL — usually the user's email
value           text        NOT NULL — the token value
expiresAt       timestamp   NOT NULL
created_at / updated_at
```

---

### `invite`

```
id              text        PK (UUID)
email           text        NOT NULL — the invited address
token           text        NOT NULL, UNIQUE (UUID used in the signup URL)
role            text        NOT NULL, default 'user'
expiresAt       timestamp   NOT NULL — default 7 days from creation
usedAt          timestamp   nullable — set when token is consumed
created_at      timestamp   NOT NULL

INDEX  invite_token_idx ON (token)
```

---

## Entity Relationships

```
product ──< license ──< license_user >── user
   │                                      │
   └──< license_request >────────────────┘

user ──< session
user ──< account
user ──< audit_log (nullable, set null on delete)
```

- One `product` has many `license`s.
- One `license` has many `license_user` assignments.
- One `user` has many `license_user` assignments (across different licenses/products).
- One `product` + one `user` can have many `license_request`s (one per approval cycle).
- `audit_log.userId` is nullable so historical entries remain after user deletion.

---

## Table Factory Helpers

Most application tables are defined using helpers in `src/lib/server/db/utils/table-factory.ts`:

```ts
defineTable(name, columns, extraConfig?)
// Adds: id (uuid, random), created_at (timestamp)

defineTableWithUpdate(name, columns, extraConfig?)
// Adds: id (uuid, random), created_at, updated_at (auto-refreshed on row update)
```

Auth tables (`user`, `session`, `account`, `verification`) are generated by Better Auth and use `text` PKs, not UUIDs.

---

## Working with the Schema

### Making schema changes

1. Edit `src/lib/server/db/schema.ts`
2. Run `pnpm db:generate` — creates a new SQL file in `drizzle/`
3. Review the generated SQL
4. Commit both the updated schema and the new migration file

`pnpm db:push` bypasses the migration system and pushes schema changes directly to the database. Use this only during local experimentation — never on a shared or production database.

### Querying with relations

Drizzle does **not** auto-join relations. Use `.with()` or explicit joins:

```ts
// Explicit join (preferred for performance-sensitive queries)
const rows = await db
  .select({ licenseName: product.name, key: license.key })
  .from(license)
  .innerJoin(product, eq(license.productId, product.id));

// Relational query (using relations() definitions)
const result = await db.query.product.findMany({
  with: { licenses: true },
});
```

### Transactions

Use `db.transaction()` for any multi-step write that must be atomic. The license assignment function uses a `FOR UPDATE` row lock to prevent double-assignment races:

```ts
await db.transaction(async (tx) => {
  const [lic] = await tx.select(...).from(license).where(...).for("update");
  // capacity checks
  await tx.insert(licenseUser).values({ licenseId, userId });
});
```
