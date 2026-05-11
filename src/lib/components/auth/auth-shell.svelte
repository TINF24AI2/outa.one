<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<div class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
  {@render children?.()}
</div>
