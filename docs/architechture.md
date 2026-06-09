# Architecture

## Overview

outa.one is a self-service software license management portal. Employees can browse available software products, request licenses, and view the keys they have been assigned. Administrators manage the product catalog, license inventory, user accounts, and approve or reject license requests.

The application is a **full-stack SvelteKit app** deployed as a Node.js server. There is no separate API service — the frontend and backend are colocated in the same SvelteKit project, using server-side load functions and form actions as the server layer.

---

## System Diagram

```
Browser (Svelte 5 + Tailwind)
        │
        │  HTTP (SSR + form actions)
        ▼
SvelteKit Server  ──────────────────────────────────────────┐
  hooks.server.ts (Paraglide + Better Auth middleware)       │
  +page.server.ts / +server.ts (load fns + actions)         │
  src/lib/server/  (business logic)                          │
        │                                                    │
        ├──── PostgreSQL (Drizzle ORM)                       │
        │       schema.ts + auth.schema.ts                   │
        │       drizzle/ migrations (auto-applied on boot)   │
        │                                                    │
        └──── SMTP Mail Server ──────────────────────────────┘
               Mailpit (local) / any SMTP (prod)
```

---

## Layer Responsibilities

### Browser (Client)

- Rendered by Svelte 5 components using the **runes** reactivity model (`$state`, `$derived`, `$effect`).
- Forms use `sveltekit-superforms` — submission goes via standard HTML `POST`, enhanced with `use:enhance` for SPA-like behavior.
- shadcn-svelte (built on Bits UI) provides all UI primitives. Lucide Svelte provides icons.
- Tailwind CSS 4 handles all styling via utility classes.
- No client-side API calls; all data comes from SSR page loads and form action responses.

### SvelteKit Server

Every request flows through two sequential middleware hooks in `src/hooks.server.ts`:

1. **Paraglide** — detects the user's locale from a cookie (falling back to the `Accept-Language` header), sets it on the request, and injects `lang` and `dir` attributes into the HTML shell.
2. **Better Auth** — reads the session cookie, calls `auth.api.getSession()`, and populates `event.locals.user` and `event.locals.session`. All protected route code reads from `event.locals`; no client-side auth check is needed.

On first boot the `init` hook runs DB migrations and seeds demo data before the server accepts requests.

#### Route Groups

| Group                    | Paths                                                                                                                         | Auth requirement                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `(auth)`                 | `/login`, `/signup`, `/forgot-password`, `/reset-password`                                                                    | Public — redirects to `/request` if already signed in |
| `(protected)/(employee)` | `/request`, `/my-licenses`, `/license-history`                                                                                | Any authenticated user                                |
| `(protected)/admin`      | `/admin/dashboard`, `/admin/products`, `/admin/licenses`, `/admin/requests`, `/admin/users`, `/admin/audit`, `/admin/reports` | `user.role === 'admin'`                               |

Auth guards live in `src/lib/server/auth/guards.ts` and are called at the top of every load function and action.

### Business Logic (`src/lib/server/`)

Server-only modules that contain all domain logic:

| Module                      | Responsibility                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `auth.ts`                   | Better Auth configuration — email/password, admin plugin, SMTP for password reset                                                   |
| `auth/guards.ts`            | `requireAuthenticatedUser`, `requireAdminUser`, `redirectAuthenticated`                                                             |
| `db/schema.ts`              | All Drizzle table definitions (application tables)                                                                                  |
| `db/auth.schema.ts`         | Better Auth tables (`user`, `session`, `account`, `verification`, `invite`)                                                         |
| `db/utils/table-factory.ts` | `defineTable` / `defineTableWithUpdate` helpers — add `id`, `createdAt`, `updatedAt` automatically                                  |
| `licenses.ts`               | `assignUserToLicense` / `unassignUserFromLicense` — transactional, row-locked capacity checks                                       |
| `users.ts`                  | `listManagedUsers`, `inviteManagedUser`, `resendManagedInvite`, `cancelManagedInvite`, `updateManagedUserRole`, `removeManagedUser` |
| `invites.ts`                | `createInvite`, `getValidInvite`, `consumeInvite`                                                                                   |
| `audit.ts`                  | `createAuditLog` — appends a row to `audit_log` from a `RequestEvent`                                                               |
| `mail.ts`                   | Nodemailer transporter singleton; `sendEmail({ to, subject, html })`                                                                |
| `email-templates.ts`        | Raw HTML email templates: invite, password reset, license approved/rejected, request notification                                   |

### Database

PostgreSQL 15+, accessed through **Drizzle ORM**. Drizzle provides a type-safe query builder (not an ActiveRecord ORM). Relations are **not auto-joined** — queries must use `.with()` or explicit joins.

Migrations are stored in `drizzle/` as plain SQL files, generated by `drizzle-kit`, and applied automatically on startup via the `init` hook.

See [database.md](database.md) for the full schema reference.

### Mail

Nodemailer sends via SMTP. In local development Mailpit catches all outgoing mail at `localhost:1025`; the web UI is at `http://localhost:8025`.

Email delivery in `users.ts` is intentionally best-effort — a failure to send an invite email does not block the invite URL from being returned to the admin.

See [email.md](email.md) for all template details.

---

## Key Data Flows

### License Request (no approval required)

```
Employee → POST /request (productId)
  └─ server: find available license for product
       └─ assignUserToLicense(licenseId, userId)  [transaction + row lock]
            └─ insert into license_user
  └─ createAuditLog(license.user_assigned)
  └─ return licenseKey to client
```

### License Request (approval required)

```
Employee → POST /request (productId)
  └─ insert licenseRequest { status: 'pending' }
  └─ createAuditLog(license_request.submitted)
  └─ sendEmail → all admins (notification)

Admin → POST /admin/requests (approve, requestId)
  └─ find available license with capacity
  └─ assignUserToLicense(licenseId, userId)
  └─ update licenseRequest { status: 'approved' }
  └─ createAuditLog(license_request.approved)
  └─ sendEmail → employee (approved + license key)
```

### User Invite Flow

```
Admin → POST /admin/users (invite, email, role)
  └─ createInvite(email, role)  ← refreshes expiry if pending invite exists
  └─ sendEmail → inviteEmail(url)  [best-effort]
  └─ return inviteUrl to admin

Employee → GET /signup?token=<uuid>
  └─ getValidInvite(token)  ← validates expiry + used_at
  └─ render form pre-filled with email

Employee → POST /signup
  └─ re-validate token
  └─ auth.api.signUpEmail(...)
  └─ if role=admin: update user.role='admin'
  └─ consumeInvite(token)  ← sets used_at
  └─ redirect /signup/success
```

---

## Technology Decisions

| Decision                       | Rationale                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| SvelteKit colocated full-stack | No API/client split to maintain; server load functions and actions are the API             |
| Drizzle ORM (not Prisma)       | Closer to SQL, lighter runtime, first-class Postgres support                               |
| Better Auth                    | Modular, minimal build; the `admin` plugin adds role management without a full auth server |
| sveltekit-superforms + Zod     | Server-validated forms with inline field errors; no extra state management                 |
| Paraglide (inlang)             | Generates typed JS message functions at build time — zero runtime i18n library overhead    |
| Invite-only signup             | Security requirement; prevents self-registration                                           |
| Auto-migrate on boot           | Simplifies deployment — no separate migration step required                                |
