<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    subtitle?: string;
    children?: Snippet;
  };

  let { title, subtitle, children }: Props = $props();
</script>

<div class="h-fit w-full border-b px-8 py-5">
  <div class="mx-auto flex w-full max-w-5xl items-center justify-between">
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if subtitle}
        <p>{subtitle}</p>
      {/if}
    </div>
    <div>
      {@render children?.()}
    </div>
  </div>
</div>
