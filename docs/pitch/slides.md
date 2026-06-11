---
theme: apple-basic
colorSchema: light
highlighter: shiki
lineNumbers: false
fonts:
  sans: "Inter"
  mono: "Fira Code"
transition: slide-left
title: outa.one — License Management Portal
titleTemplate: "%s · outa.one"
drawings:
  persist: false
layout: intro
---

# outa.one

A self-service software license management portal

<div class="absolute bottom-10 text-sm opacity-40">University Software Engineering Group Project · 2025</div>

<style>
.slidev-layout.intro {
  background: #4353F0 !important;
}
.slidev-layout.intro h1,
.slidev-layout.intro p,
.slidev-layout.intro div {
  color: white !important;
}
</style>

<!--
Set the scene — the audience knows a portal was built; now we explain the why behind every decision.
-->

---

# How does an IT consultant get a license today?

<div class="flex items-center gap-5 mt-6 mb-7">
  <div class="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
    <div class="text-3xl mb-2">📧</div>
    <div class="font-semibold text-sm">1. Employee emails IT</div>
    <div class="text-xs text-gray-500 mt-1">"Can I get a Photoshop license?"</div>
  </div>
  <div class="text-xl text-gray-300">→</div>
  <div class="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
    <div class="text-3xl mb-2">📂</div>
    <div class="font-semibold text-sm">2. IT searches shared drives</div>
    <div class="text-xs text-gray-500 mt-1">Spreadsheet, maybe outdated</div>
  </div>
  <div class="text-xl text-gray-300">→</div>
  <div class="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
    <div class="text-3xl mb-2">📋</div>
    <div class="font-semibold text-sm">3. IT copies key, replies</div>
    <div class="text-xs text-gray-500 mt-1">Hours or days later</div>
  </div>
</div>

- No audit trail — nobody knows who has what
- Shared spreadsheets go stale, keys get reused
- Over-assigned seats, under-utilized licenses
- IT time wasted on routine, low-value requests

---

## layout: statement

# outa.one is a self-service portal where employees claim their own licenses and admins stay in control — without writing a single email.

<p class="text-xl! mt-8! opacity-50">Two roles. One source of truth. Zero manual hand-offs.</p>

<!--
Pause here for effect. The rest of the deck fills in the "how."
-->

---

layout: image-right
image: /mockups/login-screen.jpg

---

# Login Screen

### Invite-only by design

- No public registration surface
- Admin invites users via email
- 7-day sign-up link delivered automatically
- Employee and admin roles

### Auth

- Email + password via Better Auth
- Sessions in PostgreSQL — revocable instantly

### Demo-friendly

- Demo credentials shown when demo accounts exist
- Disappears on a clean production database

---

layout: image-right
image: /mockups/license-requests.jpg

---

# Employee: Request a License

### The self-service flow

- Browse the product catalog
- Request with one click
- Two outcomes:

<div class="grid grid-cols-1 gap-3 mt-4 text-sm">
  <div class="bg-green-50 border border-green-200 rounded-lg p-3">
    <div class="font-semibold text-green-700">Instant</div>
    <div class="text-gray-600 mt-1">Key delivered in the same response — copy to clipboard</div>
  </div>
  <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
    <div class="font-semibold text-amber-700">Pending Approval</div>
    <div class="text-gray-600 mt-1">Admins notified by email — key sent on approval</div>
  </div>
</div>

<div class="mt-5 font-semibold">No spreadsheet. No email. No waiting.</div>

---

layout: image-right
image: /mockups/products-list.jpg

---

# Admin: Products & Licenses

### Two key settings per product

| Setting              | Effect                            |
| -------------------- | --------------------------------- |
| `requiresApproval`   | Gate delivery behind admin review |
| `maxLicensesPerUser` | Cap keys per user                 |

### License key inventory

- Upload keys with a `usageVolume` per key
- Single-seat, shared, or unlimited — same field, different value
- Availability updates in real time

---

layout: image-right
image: /mockups/licenses-overview.jpg

---

# Admin: License Overview

### Full visibility

- All keys for a product in one view
- See exactly who holds each key
- Direct assign or revoke — bypass the request flow
- Every action links to the audit trail

### Capacity at a glance

- `usageVolume` vs. current assignment count per key
- Instantly spot which keys are full vs. available

---

layout: image-right
image: /mockups/users-management.jpg

---

# Admin: User Management

### Invite flow

1. Admin enters email + role → 7-day UUID token sent
2. Employee clicks link, sets password, token burned

### Inline pending invites

Active users and pending invites in one list — resend or cancel any invite

### Safeguards

- Role management: employee ↔ admin
- At-least-one-admin guard — cannot remove the last admin

---

layout: section
transition: fade

---

# Architecture

---

## transition: fade

# Full-Stack Without the Split

<div class="flex justify-center my-3">
  <img :src="'/architecture.svg'" class="max-h-56 w-auto" alt="Architecture diagram" />
</div>

<div class="grid grid-cols-4 gap-3 text-xs">
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
    <div class="font-semibold text-blue-700 mb-1">Browser</div>
    <div class="text-gray-600">Svelte 5 + Tailwind CSS</div>
  </div>
  <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
    <div class="font-semibold text-purple-700 mb-1">SvelteKit Server</div>
    <div class="text-gray-600">Load functions + Form actions = the API</div>
  </div>
  <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
    <div class="font-semibold text-green-700 mb-1">PostgreSQL 15</div>
    <div class="text-gray-600">Drizzle ORM</div>
  </div>
  <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
    <div class="font-semibold text-orange-700 mb-1">SMTP</div>
    <div class="text-gray-600">Nodemailer → Mailpit / any provider</div>
  </div>
</div>

---

## layout: two-cols

# Technology Choices

<div class="mt-2 text-sm">

| Tool             | Version    |
| ---------------- | ---------- |
| SvelteKit        | 2.57       |
| Svelte           | 5 (runes)  |
| Drizzle ORM      | 0.45       |
| Better Auth      | 1.4        |
| superforms + Zod | 2.30 + 4.4 |
| Paraglide        | 1.x        |
| Tailwind CSS     | 4          |
| Storybook        | 10.3       |

</div>

::right::

<div class="mt-14 space-y-2 text-sm">
  <div><span class="font-semibold">SvelteKit</span> — colocation removes API/client mismatch; SSR by default</div>
  <div><span class="font-semibold">Drizzle</span> — type-safe SQL builder, closer to SQL than Prisma, lighter</div>
  <div><span class="font-semibold">Better Auth</span> — admin plugin adds role management without a full auth server</div>
  <div><span class="font-semibold">superforms + Zod</span> — server-validated forms, no extra client state</div>
  <div><span class="font-semibold">Paraglide</span> — typed message functions at build time, zero runtime i18n overhead</div>
  <div><span class="font-semibold">Tailwind CSS 4</span> — CSS-first config, faster builds</div>
  <div><span class="font-semibold">Storybook</span> — component isolation and visual baseline</div>
</div>

---

## layout: section

# Design Decisions

---

# License Capacity Model

<div class="grid grid-cols-2 gap-6 mt-2">
  <div>
    <div class="text-sm font-semibold text-gray-500 mb-2">Per-key: <code>usageVolume</code></div>

| Value      | Meaning                     |
| ---------- | --------------------------- |
| `1`        | Single-seat — one user only |
| `N > 1`    | N users share this key      |
| `0` / `-1` | Unlimited — no seat cap     |

  </div>
  <div>
    <div class="text-sm font-semibold text-gray-500 mb-2">Per-product: <code>maxLicensesPerUser</code></div>

| Value   | Meaning                    |
| ------- | -------------------------- |
| `1`     | One key per user (default) |
| `N > 1` | Per-user cap of N          |
| `0`     | Unlimited per user         |

  </div>
</div>

<div class="mt-4 grid grid-cols-3 gap-3 text-sm">
  <div class="bg-gray-50 rounded-lg p-3">
    <div class="font-semibold">Adobe Photoshop</div>
    <div class="text-gray-500 text-xs mt-1">usageVolume=1, max=1 → one key, one user</div>
  </div>
  <div class="bg-gray-50 rounded-lg p-3">
    <div class="font-semibold">Slack workspace</div>
    <div class="text-gray-500 text-xs mt-1">usageVolume=50, max=1 → 50 seats on one key</div>
  </div>
  <div class="bg-gray-50 rounded-lg p-3">
    <div class="font-semibold">Open-source tool</div>
    <div class="text-gray-500 text-xs mt-1">usageVolume=-1, max=0 → unlimited, no caps</div>
  </div>
</div>

<div class="mt-3 text-sm text-gray-400 italic">Two integers express every commercial license model — no separate "license type" enum needed.</div>

---

## layout: two-cols

# Approval Workflow Duality

### `requiresApproval: false`

```
Employee requests
  ↓
assignUserToLicense()
  ↓
Key delivered instantly
```

Key sent in the same HTTP response.

<div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
  Zero admin involvement for trusted products.
</div>

::right::

### `requiresApproval: true`

```
Employee requests
  ↓
licenseRequest { pending }
  ↓
Email → all admins notified
  ↓
Admin approves
  ↓
assignUserToLicense()
  ↓
Email → employee receives key
```

<div class="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
  Same <code>assignUserToLicense()</code> in both paths — approval just gates <em>when</em> it runs.
</div>

---

# Race Condition Prevention

### What if 20 employees request the last seat simultaneously?

```ts {6,9-11}
await db.transaction(async (tx) => {
  const [lic] = await tx
    .select({ id: license.id, usageVolume: license.usageVolume })
    .from(license)
    .where(eq(license.id, licenseId))
    .for("update"); // row-level lock

  const [{ count }] = await tx.select({ count: count() }).from(licenseUser).where(eq(licenseUser.licenseId, licenseId));
  if (Number(count) >= lic.usageVolume)
    // capacity check while locked
    return { ok: false, reason: "license_at_capacity" };

  await tx.insert(licenseUser).values({ licenseId, userId });
  return { ok: true };
});
```

```ts
type AssignResult =
  | { ok: true }
  | { ok: false; reason: "license_not_found" | "user_not_found" | "license_at_capacity" | "user_at_product_cap" };
```

---

# Invite-Only User Management

<div class="flex items-start gap-4 mt-4 mb-5">
  <div class="flex-1 bg-gray-50 rounded-xl p-4 text-sm">
    <div class="font-semibold text-[#4353F0] mb-2">1 — Admin invites</div>
    <code class="text-xs">createInvite(email, role)</code>
    <div class="text-gray-500 mt-1">7-day UUID token stored; email sent</div>
  </div>
  <div class="text-xl text-gray-300 mt-8">→</div>
  <div class="flex-1 bg-gray-50 rounded-xl p-4 text-sm">
    <div class="font-semibold text-[#4353F0] mb-2">2 — Employee clicks link</div>
    <code class="text-xs">getValidInvite(token)</code>
    <div class="text-gray-500 mt-1">Validates token, expiry, usedAt</div>
  </div>
  <div class="text-xl text-gray-300 mt-8">→</div>
  <div class="flex-1 bg-gray-50 rounded-xl p-4 text-sm">
    <div class="font-semibold text-[#4353F0] mb-2">3 — Sets password</div>
    <code class="text-xs">consumeInvite(token)</code>
    <div class="text-gray-500 mt-1">Token burned — cannot be reused</div>
  </div>
</div>

- Re-inviting the same email **refreshes expiry** — no duplicate rows
- Token is a UUID — not guessable
- Expired or used tokens rejected at **load time**, not only on submit
- No admin toggle to "enable self-registration" — the only path in is an invite

---

## layout: two-cols

# Audit Log

**Append-only, immutable history**

- Rows never updated or deleted
- `userName` **denormalized** — readable even after user deletion
- Best-effort write — never blocks the triggering operation
- 15 action types across all domains
- Filterable by product, user, date, action
- CSV export at `/admin/reports/export.csv`

::right::

<div class="mt-10">

```
license.created
license.deleted
license.user_assigned
license.user_unassigned

product.created / updated / deleted

user.invited
user.invite_resent / cancelled
user.role_updated / removed

license_request.submitted
license_request.approved
license_request.rejected
```

</div>

---

# Email is a Notification, Not a Transaction

<div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mt-2 mb-4 italic text-gray-700 text-sm">
  "A failed SMTP connection must never prevent a license from being assigned or an invite from being created."
</div>

<div class="grid grid-cols-2 gap-6">
<div>

```ts
try {
  await sendEmail({ to, subject, html });
} catch (err) {
  console.error("Email send failed:", err);
  // operation continues — URL still returned
}
```

Local dev: **Mailpit** catches all mail at `localhost:1025`

</div>
<div class="text-sm mt-2">

| Email                | Recipient    | Trigger             |
| -------------------- | ------------ | ------------------- |
| Invite               | New employee | Admin invites       |
| Password reset       | Employee     | Forgot password     |
| Request notification | All admins   | New pending request |
| License approved     | Employee     | Admin approves      |
| License rejected     | Employee     | Admin rejects       |

</div>
</div>

---

## layout: two-cols

# Table Factory Helpers

**Without factory:**

```ts
export const product = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
});
```

::right::

**With factory:**

```ts
// Injects: id (uuid PK), createdAt, updatedAt

export const product = defineTableWithUpdate("product", {
  name: text("name").notNull(),
  // ...
});
```

<div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
  Every table gets consistent PKs and timestamps. Full TypeScript inference on injected columns.
</div>

---

## transition: fade

# Entity Relationship Diagram

<div class="flex justify-center mt-2">
  <img :src="'/erm.svg'" class="max-h-72 w-auto" alt="Entity Relationship Diagram" />
</div>

<div class="grid grid-cols-3 gap-3 mt-3 text-xs">
  <div class="bg-gray-50 rounded-lg p-2 text-center">
    <code>product ──&lt; license ──&lt; license_user &gt;── user</code>
    <div class="text-gray-500 mt-1">Core assignment chain</div>
  </div>
  <div class="bg-gray-50 rounded-lg p-2 text-center">
    <code>product ──&lt; license_request &gt;── user</code>
    <div class="text-gray-500 mt-1">Approval workflow</div>
  </div>
  <div class="bg-gray-50 rounded-lg p-2 text-center">
    Cascade deletes at DB layer — no orphaned rows
  </div>
</div>

---

## layout: section

# Developer Experience

---

# DX Highlights

<div class="grid grid-cols-2 gap-4 mt-3">
  <div class="bg-gray-50 rounded-xl p-4">
    <div class="font-semibold text-[#4353F0] mb-2">Type-safe forms</div>
    <div class="text-sm text-gray-600">Zod schema → superforms → server action → inline field errors. One round trip, no manual <code>FormData</code> parsing.</div>
  </div>
  <div class="bg-gray-50 rounded-xl p-4">
    <div class="font-semibold text-[#4353F0] mb-2">Compile-time i18n</div>
    <div class="text-sm text-gray-600">Paraglide generates <code>m.someKey()</code> functions. Wrong key name = TypeScript error at build time, not a silent empty string.</div>
  </div>
  <div class="bg-gray-50 rounded-xl p-4">
    <div class="font-semibold text-[#4353F0] mb-2">Auto-migrate on boot</div>
    <div class="text-sm text-gray-600">The <code>init</code> hook applies all pending migrations before the server accepts requests. No "forgot to run migrations" failures.</div>
  </div>
  <div class="bg-gray-50 rounded-xl p-4">
    <div class="font-semibold text-[#4353F0] mb-2">Storybook isolation</div>
    <div class="text-sm text-gray-600">Components built and documented in Storybook before wiring to real routes. Faster iteration, visual component registry.</div>
  </div>
</div>

---

## layout: two-cols

# Security by Architecture

- All auth checks server-side in `guards.ts`
- Invite-only — no public registration surface
- Sessions in PostgreSQL — revocable instantly
- Passwords hashed with bcrypt
- Row-level locking prevents TOCTOU races
- Audit log is append-only
- Tokens are UUIDs, single-use, expire in 7d / 1h
- At-least-one-admin guard prevents lockout

::right::

```ts
// Every admin route
export async function load(event) {
  requireAdminUser(event);
  // throws redirect if not admin
}

// Every employee route
export async function load(event) {
  requireAuthenticatedUser(event);
  // throws redirect to /login
}
```

<div class="mt-4 text-sm text-gray-600">
No client-side role checks. No security through obscurity. The server validates every request.
</div>

---

# What Admins Can See

<div class="grid grid-cols-3 gap-4 mt-4">
  <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div class="font-semibold text-[#4353F0] mb-3">Dashboard</div>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>Total products & license keys</li>
      <li>Assigned vs. available seats</li>
      <li>Pending request count</li>
    </ul>
  </div>
  <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div class="font-semibold text-[#4353F0] mb-3">Audit Log</div>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>Filter by product, user, date, action</li>
      <li>15 auditable action types</li>
      <li>Names preserved after user deletion</li>
      <li>CSV export for compliance</li>
    </ul>
  </div>
  <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <div class="font-semibold text-[#4353F0] mb-3">Reports</div>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>CSV & PDF export</li>
      <li>Same filters as audit view</li>
      <li>Bar chart overview in-browser</li>
    </ul>
  </div>
</div>

<div class="mt-4 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
  Employees have their own view: <code>/license-history</code> shows personal assignment and request history.
</div>

---

## layout: two-cols

# Limitations & Next Steps

**Known constraints**

- i18n: English + German — translations are maintained manually
- No bulk key import — keys added one at a time
- No SAML/SSO wired (Better Auth supports it as a plugin)
- Notification-only emails — no digest or configurable frequency
- No license expiry dates or renewal alerts

::right::

**Natural next steps**

<div class="space-y-3 mt-2 text-sm">
  <div class="bg-gray-50 rounded-lg p-3">
    <span class="font-semibold">Bulk CSV import</span> — paste a list of keys instead of entering one at a time
  </div>
  <div class="bg-gray-50 rounded-lg p-3">
    <span class="font-semibold">SAML/OIDC</span> — wire up Better Auth's enterprise plugin for SSO
  </div>
  <div class="bg-gray-50 rounded-lg p-3">
    <span class="font-semibold">Expiry & renewal</span> — <code>expiresAt</code> on license + notify before expiry
  </div>
  <div class="bg-gray-50 rounded-lg p-3">
    <span class="font-semibold">Webhooks</span> — outbound events for procurement system integration
  </div>
</div>

---

# Team & Process

<div class="grid grid-cols-2 gap-6 mt-3">
  <div>
    <div class="font-semibold mb-2">Team — 6 people</div>
    <div class="text-sm text-gray-600">1 Product Owner · 1 Scrum Master · 4 Developers</div>
    <div class="font-semibold mt-4 mb-2">Process — Scrum</div>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>5 sprints with weekly ceremonies</li>
      <li>Sprint Review → Retro → Planning (~90 min)</li>
      <li>Backlog grooming between sprints</li>
    </ul>
  </div>
  <div>
    <div class="font-semibold mb-2">Engineering discipline</div>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>GitHub feature-branch workflow, every change via PR</li>
      <li>Conventional Commits, rebase merges (linear history)</li>
      <li>CI: lint · type-check · format on every PR</li>
      <li>Pre-commit hooks via Lefthook</li>
      <li>PR checklist requires docs updates for schema changes</li>
    </ul>
    <div class="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
      The process shaped code quality as much as the tools — which is why the <code>docs/</code> folder is comprehensive.
    </div>
  </div>
</div>

---

## layout: intro

# outa.one

Self-service license management — built, tested, documented.

<div class="absolute bottom-10 text-sm opacity-40">
  SvelteKit 2 · PostgreSQL 15 · Drizzle ORM · Better Auth<br>
  Demo: sarah.johnson@company.com · emily.rodriguez@company.com
</div>

<style>
.slidev-layout.intro {
  background: #4353F0 !important;
}
.slidev-layout.intro h1,
.slidev-layout.intro p,
.slidev-layout.intro div {
  color: white !important;
}
</style>
