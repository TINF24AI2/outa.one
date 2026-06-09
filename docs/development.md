# Development Guide

This document covers the common patterns, conventions, and tools used in day-to-day development.

---

## Adding UI Components

We use [shadcn-svelte](https://shadcn-svelte.com) as our component library. All shadcn components live in `src/lib/components/ui/`.

1. Check if the component already exists in `src/lib/components/ui/`.
2. If not, find it in the [shadcn-svelte docs](https://shadcn-svelte.com/docs/components) and run the install command — make sure to select `pnpm` when prompted.
3. Custom application components (not from shadcn) go in `src/lib/components/app/`. Follow the same styling conventions.

---

## Importing Icons

We use [lucide-svelte](https://lucide.dev/). Import icons by name directly from the package:

```svelte
<script lang="ts">
  import { Home } from "lucide-svelte";
</script>

<Home size={24} />
```

Browse all available icons at [lucide.dev/icons](https://lucide.dev/icons).

---

## Svelte 5 Runes

The project uses Svelte 5 with the **runes** reactivity model. Do not use the legacy `$:` reactive syntax.

| Rune                     | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| `$state(value)`          | Reactive local state                                 |
| `$derived(expr)`         | Computed value that updates when dependencies change |
| `$effect(() => { ... })` | Side effects (runs after DOM updates)                |
| `$props()`               | Declare component props                              |

Example:

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log("count changed:", count);
  });
</script>
```

---

## Forms Pattern

All forms use [sveltekit-superforms](https://superforms.rocks) with [Zod 4](https://zod.dev) for validation.

### Zod schemas

Schemas live in `src/lib/schemas/`. Each domain has its own file (`auth.ts`, `licenses.ts`, `products.ts`, etc.).

### Server side

```ts
// +page.server.ts
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import { mySchema } from "$lib/schemas/my-schema";

// Load: create an empty form
export const load = async () => {
  const form = await superValidate(zod(mySchema));
  return { form };
};

// Action: validate incoming POST data
export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(mySchema));
    if (!form.valid) return fail(400, { form });

    // ... do work ...
    return { form };
  },
};
```

### Client side

```svelte
<script lang="ts">
  import { superForm } from "sveltekit-superforms";

  import * as Form from "$lib/components/ui/form";

  let { data } = $props();
  const { form, errors, enhance } = superForm(data.form);
</script>

<form method="POST" use:enhance>
  <Form.Field {form} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <input {...props} bind:value={$form.email} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <button type="submit">Submit</button>
</form>
```

`Form.FieldErrors` automatically shows validation errors for the field.

### Returning messages from actions

Use `message()` from superforms to return non-field-level errors (e.g. 409 Conflict):

```ts
import { message } from "sveltekit-superforms";

return message(form, "No available license slots", { status: 409 });
```

---

## Internationalisation (i18n)

We use [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) (inlang). Message strings are **compiled at build time** into typed JS functions — there is no runtime i18n library.

### Message files

- English: `messages/en.json`
- German: `messages/de.json`

Keys use `snake_case` grouped by feature, e.g.:

```json
{
  "request_error_not_found": "Product not found.",
  "request_error_already_pending": "You already have a pending request for this product."
}
```

### Using messages in code

Import the `m` object:

```svelte
<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
</script>

<p>{m.request_error_not_found()}</p>
```

In server-side `.ts` files:

```ts
import { m } from "$lib/paraglide/messages.js";

return message(form, m.request_error_at_cap(), { status: 409 });
```

### Adding a new string

1. Add the key and English value to `messages/en.json`.
2. Add the same key with the German translation to `messages/de.json`.
3. Run `pnpm messages:sort` to normalise both files (required before committing — enforced by Lefthook).
4. The `m.your_new_key()` function is immediately available via TypeScript inference.

### Locale detection

Locale is set per-request by the Paraglide middleware in `hooks.server.ts`. Priority:

1. `locale` cookie (set when the user explicitly switches language)
2. `Accept-Language` request header
3. Default: `en`

---

## Server-Only Code

Anything in `src/lib/server/` is server-only and cannot be imported in browser-executed code. SvelteKit enforces this at build time. Keep all database queries, auth calls, and secrets inside this directory.

---

## Database Queries

See [database.md](database.md) for the full schema. Key points:

- Import `db` from `$lib/server/db`
- Import table objects from `$lib/server/db/schema`
- Relations are **not auto-joined** — use `.with()` or explicit `innerJoin` / `leftJoin`
- For multi-step writes use `db.transaction(async (tx) => { ... })`

```ts
import { eq } from "drizzle-orm";

import { db } from "$lib/server/db";
import { license, product } from "$lib/server/db/schema";

const products = await db.select().from(product);

const licenses = await db.select().from(license).where(eq(license.productId, someProductId));
```

---

## Audit Logging

Call `createAuditLog` in every server action that mutates data:

```ts
import { createAuditLog } from "$lib/server/audit";

await createAuditLog(event, {
  action: "product.created",
  entityType: "product",
  entityId: newProduct.id,
  metadata: { name: newProduct.name },
});
```

See [audit.md](audit.md) for all action types and conventions.

---

## Coding Style

### TypeScript

- Strict mode is enabled — no implicit `any`.
- Prefer `const` over `let`; avoid `var`.
- Use explicit return types on exported functions.
- Prefer named exports over default exports (except Svelte components and SvelteKit page files).

### Naming

| Thing                    | Convention                                       | Example                        |
| ------------------------ | ------------------------------------------------ | ------------------------------ |
| Files                    | `kebab-case`                                     | `license-key-cell.svelte`      |
| Svelte components        | `PascalCase`                                     | `LicenseKeyCell`               |
| Variables / functions    | `camelCase`                                      | `assignUserToLicense`          |
| DB column names (schema) | `camelCase` in Drizzle, `snake_case` in SQL      | `usageVolume` → `usage_volume` |
| Zod schemas              | `camelCase` suffixed with `Schema`               | `requestLicenseSchema`         |
| Types / interfaces       | `PascalCase`                                     | `ManagedUserListItem`          |
| Route group folders      | `(groupName)` — parentheses are SvelteKit syntax | `(protected)`                  |

### Error handling in actions

- Use `fail(statusCode, { form })` for validation errors (superforms handles display).
- Use `message(form, "...", { status })` for business logic errors shown as a toast/message.
- Throw `redirect()` for auth redirects — never return them.
- Catch and rethrow only when you can add value; let unexpected errors bubble to SvelteKit's error handler.

### No silent failures

- Email delivery is intentionally best-effort (wrapped in try/catch in `users.ts`), but this is an explicit documented decision.
- All other async errors should propagate unless there is a documented reason to swallow them.
