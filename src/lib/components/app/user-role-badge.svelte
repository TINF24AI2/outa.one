<script lang="ts">
  import { m } from "$lib/paraglide/messages";
  import type { ManagedRole } from "$lib/user-management";

  let { role }: { role: ManagedRole } = $props();
</script>

<span
  class={`inline-flex shrink-0 items-center rounded border px-2.5 py-0.5 text-xs font-medium ${
    role === "admin" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700"
  }`}
>
  {role === "admin" ? m.role_admin() : m.role_employee()}
</span>
