<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    subtitle?: string;
    children?: Snippet;
  };

  let { title, subtitle, children }: Props = $props();
</script>

<div class="h-fit w-full border-b px-6 py-5">
  <div class="mx-auto flex w-full max-w-7xl items-center justify-between">
    <div>
      <h2 class="text-2xl font-semibold">{title}</h2>
      {#if subtitle}
        <p class="text-muted-foreground pt-2 text-sm">
          {subtitle}
        </p>
      {/if}
    </div>
    <div>
      {@render children?.()}
    </div>
  </div>
</div>
