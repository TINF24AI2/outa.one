<script lang="ts">
  import type { Snippet } from "svelte";

  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { cn } from "$lib/utils";

  type Props = {
    title: string;
    class?: string;
    contentClass?: string;
    icon?: Snippet;
    description?: Snippet;
    footer?: Snippet;
    children?: Snippet;
  };

  let { title, class: className, contentClass, icon, description, footer, children }: Props = $props();
</script>

<Card class={cn("w-full max-w-sm", className)}>
  <CardHeader class="items-center justify-items-center text-center">
    {#if icon}
      {@render icon()}
    {/if}
    <CardTitle class="text-xl">{title}</CardTitle>
    {#if description}
      <CardDescription>{@render description()}</CardDescription>
    {/if}
  </CardHeader>

  <CardContent class={contentClass}>
    {@render children?.()}
  </CardContent>

  {#if footer}
    <CardFooter class="flex-col gap-3">
      {@render footer()}
    </CardFooter>
  {/if}
</Card>
