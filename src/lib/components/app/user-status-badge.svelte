<script lang="ts">
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { m } from "$lib/paraglide/messages";

  let { status }: { status: "active" | "pending" } = $props();
</script>

<Badge
  variant="outline"
  class={status === "pending"
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700"}
>
  {status === "pending" ? m.users_status_pending() : m.users_status_active()}
</Badge>
