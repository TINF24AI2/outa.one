# Authentication & Access Control

This document covers the full authentication system: how sessions work, the login/signup flow, invite-only access, roles, and demo users.

---

## Overview

Authentication is handled by [Better Auth](https://better-auth.dev) using email + password credentials. There is no self-registration — every new user must be invited by an admin. Sessions are stored in the database and attached to requests via a server hook.

---

## Stack

| Layer | Technology |
|---|---|
| Auth library | `better-auth` (minimal build + `admin` plugin) |
| Session storage | PostgreSQL via Drizzle ORM |
| Cookie handling | `sveltekitCookies` plugin (Better Auth ↔ SvelteKit) |
| Session injection | `src/hooks.server.ts` |

---

## Request Lifecycle

Every request passes through `src/hooks.server.ts`, which runs two hooks in sequence:

1. **Paraglide** — sets the locale on the request
2. **Better Auth** — calls `auth.api.getSession` and populates `event.locals.user` and `event.locals.session` if a valid session cookie is present

`event.locals` shape (defined in `src/app.d.ts`):

```ts
interface Locals {
  user?: User;
  session?: Session;
}
```

Protected routes read `event.locals.user` to check authentication and role.

---

## Route Groups

| Group | Path | Access |
|---|---|---|
| `(auth)` | `/login`, `/signup`, `/forgot-password`, `/reset-password` | Public — redirects to `/dashboard` if already logged in |
| `(protected)` | `/dashboard`, … | Requires session — see `(protected)/+layout.server.ts` |

The protected layout redirects to `/login` when `event.locals.user` is absent:

```ts
// src/routes/(protected)/+layout.server.ts
if (!event.locals.user) redirect(302, '/login');
return { user: event.locals.user };
```

---

## Login

**Route:** `GET/POST /login`  
**Files:** `src/routes/(auth)/login/+page.svelte`, `+page.server.ts`

### Load

- Redirects to `/dashboard` if the user is already logged in.
- Queries the database for both demo user emails and returns `hasDemoUsers: boolean`. The demo credentials section is only rendered when this is `true`.

### Form action

1. Reads `email` and `password` from `FormData`.
2. Calls `auth.api.signInEmail({ body: { email, password } })`.
3. On `APIError` → returns `fail(400, { fieldErrors: { password: 'Invalid email or password' } })`.
4. On success → `redirect(302, '/dashboard')`.

### Client-side validation

The form uses `novalidate` and `use:enhance` to gate submission:

- Email must be non-empty and match a basic email pattern.
- Password must be non-empty.
- Errors are only shown after the first submit attempt — not while typing.
- The password field has a show/hide toggle (eye icon).

---

## Sign-up (invite-only)

**Route:** `GET/POST /signup?token=<uuid>`  
**Files:** `src/routes/(auth)/signup/+page.svelte`, `+page.server.ts`

### Load

Reads `token` from the query string and validates it against the `invite` table via `getValidInvite(token)`.

| Condition | Return value | UI shown |
|---|---|---|
| No token in URL | `{ error: 'no_invite' }` | "Invite required" error card |
| Token not found / expired / used | `{ error: 'invalid_invite' }` | "Invite expired" error card |
| Valid token | `{ token, email }` | Sign-up form pre-filled with the invited email |

### Form action

1. Re-validates the token (guards against expiry between page load and submit).
2. Checks passwords match and are ≥ 8 characters.
3. Calls `auth.api.signUpEmail({ body: { email, password, name } })`.
4. If the invite carries `role: 'admin'`, immediately updates the new user row: `db.update(user).set({ role: 'admin' })`.
5. Calls `consumeInvite(token)` — sets `usedAt` so the token cannot be reused.
6. Redirects to `/signup/success`.

---

## Password Reset

**Routes:** `GET/POST /forgot-password`, `GET/POST /reset-password`  
**Files:** `src/routes/(auth)/forgot-password/`, `src/routes/(auth)/reset-password/`  
**Email template:** `src/lib/server/email-templates.ts`  
**Mailer:** `src/lib/server/mail.ts`

### Flow

```
/login → "Forgot password?" → /forgot-password
  → POST (email) → auth.api.requestPasswordReset → email sent
  → "Check your email" success state

email link → /reset-password?token=<token>
  → POST (token + new password) → auth.api.resetPassword
  → "Password reset!" success state → redirect /login (3 s)
```

### Forgot password (`/forgot-password`)

**Load** — Redirects to `/dashboard` if already logged in.

**Form action**

1. Validates email format; returns `fail(400, { fieldError })` on invalid input.
2. Calls `auth.api.requestPasswordReset({ body: { email, redirectTo: origin + '/reset-password' } })`.
3. Always returns `{ success: true, email }` — even for unknown addresses — to prevent email enumeration.

The page renders two states via `{#if form?.success}`:
- **Initial** — email input + "Send reset instructions" button + back to login link.
- **Success** — "Check your email" card showing the submitted address, a fallback note about spam, and a "Use a different email address" link that reloads the page.

### Reset password (`/reset-password?token=<token>`)

**Load** — Reads `token` from the query string; redirects to `/forgot-password` if absent.

**Form action**

1. Validates password ≥ 8 characters and both fields match.
2. Calls `auth.api.resetPassword({ body: { token, newPassword } })`.
3. On `APIError` → `fail(400, { message: 'This reset link is invalid or has expired.' })`.
4. On success → `{ success: true }`.

The page renders two states:
- **Form** — new password + confirm password fields (show/hide toggle), inline validation errors, "Reset password" button, and back to login link.
- **Success** — "Password reset!" card with a 3-second `$effect` timer that calls `goto('/login')`.

### Email
  
Template (`resetPasswordEmail(url)` in `email-templates.ts`) renders a branded HTML email with:
- outa.one logo + wordmark header
- "Reset password" CTA button
- Fallback plain-text URL in a highlighted box
- 1-hour expiry notice
- Footer disclaimer

**Environment variables required:**

| Variable | Local default | Notes |
|---|---|---|
| `SMTP_HOST` | `localhost` | Mailpit / production SMTP host |
| `SMTP_PORT` | `1025` | Mailpit / production SMTP port |
| `SMTP_USER` | `test` | SMTP credentials |
| `SMTP_PASSWORD` | `test` | SMTP credentials |
| `MAIL_FROM` | `outa.one <hey@outa.one>` | `From` header on all outgoing mail |

---

## Invite System

**File:** `src/lib/server/invites.ts`

Admins generate invite links from the dashboard. Each invite is a UUID token stored in the `invite` table.

### Database table (`invite`)

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | UUID |
| `email` | `text` | The invited email address |
| `token` | `text` UNIQUE | UUID used as the URL token |
| `role` | `text` | `'user'` (default) or `'admin'` |
| `expires_at` | `timestamp` | 7 days from creation by default |
| `used_at` | `timestamp` | Set on consumption; `null` = unused |
| `created_at` | `timestamp` | Auto-set |

### API

```ts
createInvite(email, role?, expiresInDays?)
```
- Throws if `email` is already registered.
- If a pending invite exists for that email, refreshes `expiresAt` instead of creating a duplicate.
- Otherwise inserts a new row and returns it.

```ts
getValidInvite(token)
```
- Returns the invite row if it exists, `usedAt` is null, and `expiresAt` is in the future.
- Returns `null` otherwise.

```ts
consumeInvite(token)
```
- Sets `usedAt = NOW()` to mark the token as used.

### Generating invites (dashboard)

Admins submit an email address and an optional "Grant admin rights" checkbox from `/dashboard`. The `generateInvite` form action calls `createInvite` and returns the full invite URL to display in the UI.

---

## Roles

Better Auth's `admin` plugin extends the `user` table with a `role` column.

| Role | Value | Access |
|---|---|---|
| Employee | `null` / `'user'` | Standard portal access |
| Admin | `'admin'` | Can generate invite links |

Role is checked in components and server actions via `event.locals.user.role === 'admin'`.

---

## Sign-out

The sidebar (`src/lib/components/app/sidebar.svelte`) contains a form that POSTs to `?/signOut`. The dashboard's `signOut` action calls `auth.api.signOut` and redirects to `/login`.

---

## Demo Users

For development and testing, two pre-built accounts can be seeded into the database.

### Central definition

**File:** `src/lib/demo-users.ts`

```ts
export const DEMO_PASSWORD = 'password';

export const DEMO_USERS = [
  { id: 'demo-employee', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'user' },
  { id: 'demo-admin',    name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', role: 'admin' },
];

export const DEMO_EMAILS = DEMO_USERS.map((u) => u.email);
```

This is the single source of truth — the seed script and the login page both import from here.

### Seeding

```sh
pnpm db:seedDemoUsers
```

Script: `src/lib/scripts/seed-demo-users.server.ts`

- Loads `.env` manually (runs outside SvelteKit).
- Skips users that already exist.
- Hashes the password with `better-auth/crypto`.
- Inserts one row in `user` and one in `account` (with `providerId: 'credential'`) per demo user.

### Login page visibility

The login page queries the database on load to check whether both demo accounts exist. The "Demo Credentials" card footer is only rendered when `hasDemoUsers` is `true` — it does not appear on a clean database.
