<script lang="ts">
import type { Snippet } from 'svelte';

type Props = {
  title: string;
  subtitle?: string;
  children?: Snippet;
};

let { title, subtitle, children }: Props = $props();
</script>

<div class="w-full py-5 h-fit border-b">
  <div class="w-full max-w-5xl mx-auto flex items-center justify-between">
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
