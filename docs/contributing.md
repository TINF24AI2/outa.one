# Collaboration Guidelines

This is the documentation for what conventions we use, how to get the project running locally and the workflow we prefer for collaboration.

## Table of contents

- [Development setup](#development-setup)
- [Branching & PR workflow](#branching--pr-workflow)
- [Commit messages](#commit-messages)
- [Pull request checklist](#pull-request-checklist)
- [Reviews & merging](#reviews--merging)
- [Coding style](#coding-style)
- [Naming conventions](#naming-conventions)
- [Code structure](#code-structure)

---

## Development setup

### Prerequisites

Make sure you have the latest Node.js LTS version installed. Currently, that is Node.js 24.x LTS. Download it from the [official website](https://nodejs.org/en/download/) or use [nvm](https://github.com/nvm-sh/nvm) (Linux/macOS) or [fnm](https://github.com/Schniz/fnm) (Windows).

We use [pnpm](https://pnpm.io/) as our package manager. Install it globally:

```bash
npm install -g pnpm
```

For running the Docker Compose setup, install [Docker](https://www.docker.com/get-started). On macOS, [OrbStack](https://orbstack.dev/) is recommended over Docker Desktop for better performance.

### Setting up the project

```bash
git clone https://github.com/TINF24AI2/outa.one.git
cd outa.one
pnpm i
cp .env.example .env
```

The `.env.example` file contains all required variables with working local defaults. No changes needed for local development.

### Running the development server

```bash
# Start Postgres (port 5432) and Mailpit SMTP (port 1025, web UI: http://localhost:8025)
docker compose up -d

# Start the dev server (http://localhost:5173)
# Migrations and demo data seeding run automatically on first start
pnpm dev
```

### Demo accounts

After first startup the database is seeded with:

| Name            | Email                       | Password   | Role     |
| --------------- | --------------------------- | ---------- | -------- |
| Sarah Johnson   | sarah.johnson@company.com   | `password` | Employee |
| Emily Rodriguez | emily.rodriguez@company.com | `password` | Admin    |

---

## Branching & PR workflow

We use a feature-branch workflow targeting `main`. The `main` branch has a linear history; every change requires a Pull Request enforced via GitHub.

```bash
# Start from main
git switch main
git switch -c <type>/<short-description>

# Keep your branch up to date
git fetch origin
git rebase origin/main
```

Branch name prefixes:

| Prefix      | Use for                               |
| ----------- | ------------------------------------- |
| `feat/`     | New features                          |
| `fix/`      | Bug fixes                             |
| `refactor/` | Code changes with no behaviour change |
| `docs/`     | Documentation only                    |
| `chore/`    | Dependency updates, config, tooling   |

Examples: `feat/login-page`, `fix/license-capacity-check`, `docs/update-database-schema`

---

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat: add CSV export for audit log
fix: prevent double-assignment under concurrent requests
docs: document license capacity model
refactor: extract assignUserToLicense into server module
chore: update drizzle-orm to 0.45
```

Format: `<type>: <short summary>` — present tense, no period at the end.

---

## Pull request checklist

Before requesting review:

- [ ] Branch is rebased onto `main`
- [ ] Code compiles (`pnpm build`) and type-checks (`pnpm check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] i18n files are sorted (`pnpm messages:sort`) — run if you added/changed any strings
- [ ] Relevant documentation updated (especially `docs/` if schema or flows changed)
- [ ] PR description explains what changed and why

---

## Reviews & merging

The following requirements are enforced via GitHub:

- At least one approving review from a maintainer is required.
- All CI checks must pass (lint, type-check, format).
- Only fast-forward merges (rebase) are allowed to keep `main` linear.

---

## Coding style

See [development.md](development.md) for the full coding style guide. Summary:

- TypeScript strict mode — no implicit `any`
- `const` by default, `let` only when reassignment is needed
- Named exports preferred over default exports (except Svelte components and SvelteKit page files)
- Svelte 5 runes only — no `$:` reactive statements
- All forms use `sveltekit-superforms` + Zod — no ad-hoc FormData parsing
- All user-visible strings go through Paraglide (`m.key()`) — no hardcoded English in components
- Audit log required for every action that mutates persistent data

---

## Naming conventions

| Thing                            | Convention                                                  |
| -------------------------------- | ----------------------------------------------------------- |
| Files                            | `kebab-case`                                                |
| Svelte components                | `PascalCase` (matching the filename)                        |
| Variables / functions            | `camelCase`                                                 |
| TypeScript types / interfaces    | `PascalCase`                                                |
| Zod schemas                      | `camelCase` + `Schema` suffix (e.g. `requestLicenseSchema`) |
| Database column names in Drizzle | `camelCase` (mapped to `snake_case` in SQL automatically)   |
| Environment variables            | `SCREAMING_SNAKE_CASE`                                      |
| Route group folders              | `(groupName)` — parentheses are SvelteKit syntax            |

---

## Code structure

```
src/
├── lib/
│   ├── components/
│   │   ├── app/          Application-specific components (dialogs, tables, forms)
│   │   ├── auth/         Auth-specific UI (auth panel shell, password input)
│   │   └── ui/           shadcn-svelte primitives (button, card, dialog, etc.)
│   ├── schemas/          Zod validation schemas — one file per domain
│   ├── server/           Server-only modules (cannot be imported in browser code)
│   │   ├── db/
│   │   │   ├── schema.ts        Application table definitions
│   │   │   ├── auth.schema.ts   Better Auth table definitions
│   │   │   └── utils/           Table factory helpers
│   │   ├── auth.ts        Better Auth config
│   │   ├── auth/
│   │   │   └── guards.ts  requireAuthenticatedUser, requireAdminUser, etc.
│   │   ├── licenses.ts    License assignment (transactional, capacity-checked)
│   │   ├── users.ts       User CRUD + invite management
│   │   ├── invites.ts     Invite token primitives
│   │   ├── audit.ts       Audit log writer
│   │   ├── mail.ts        Nodemailer singleton
│   │   └── email-templates.ts  All HTML email templates
│   ├── scripts/           Node.js seed scripts (run outside SvelteKit)
│   ├── paraglide/         Generated i18n runtime (do not edit manually)
│   ├── audit.ts           AuditAction / AuditEntityType type definitions
│   ├── user-management.ts Shared role utilities and formatters (runs in browser + server)
│   ├── authClient.ts      Better Auth client-side helpers
│   └── demo-users.ts      Demo account definitions (single source of truth)
├── routes/
│   ├── +page.svelte/.ts              Public landing page
│   ├── (auth)/                       Login, signup, password reset
│   └── (protected)/
│       ├── (employee)/               Employee portal
│       │   ├── request/              Request a license
│       │   ├── my-licenses/          View assigned licenses
│       │   └── license-history/      Personal audit history
│       └── admin/                    Admin section
│           ├── dashboard/            Metrics overview
│           ├── products/             Product CRUD
│           ├── licenses/             License CRUD + user assignment
│           ├── requests/             Approve / reject pending requests
│           ├── users/                User management + invites
│           ├── audit/                Full audit log viewer
│           └── reports/              CSV / PDF export
├── hooks.server.ts        Request middleware (Paraglide + Better Auth)
└── app.d.ts               TypeScript augmentation for event.locals
```

### Where to put new code

| Type of code               | Location                                                                |
| -------------------------- | ----------------------------------------------------------------------- |
| New page                   | `src/routes/(protected)/...` or `src/routes/(auth)/...`                 |
| New shadcn component       | Run `pnpm shadcn-svelte add <name>` → lands in `src/lib/components/ui/` |
| New app-specific component | `src/lib/components/app/`                                               |
| New form schema            | `src/lib/schemas/<domain>.ts`                                           |
| New server business logic  | `src/lib/server/<domain>.ts`                                            |
| New DB table               | `src/lib/server/db/schema.ts`, then `pnpm db:generate`                  |
| New i18n string            | `messages/en.json` + `messages/de.json`, then `pnpm messages:sort`      |
| New email template         | `src/lib/server/email-templates.ts` (add a new exported function)       |
