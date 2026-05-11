<script lang="ts">
  import { Eye, EyeOff } from "@lucide/svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { FormLabel } from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { cn } from "$lib/utils";

  type Props = {
    label: string;
    value?: string;
    placeholder?: string;
    autocomplete?: HTMLInputAttributes["autocomplete"];
    props?: Record<string, unknown>;
    showLabel: string;
    hideLabel: string;
    class?: string;
  };

  let {
    label,
    value = $bindable(""),
    placeholder = "••••••••",
    autocomplete,
    props = {},
    showLabel,
    hideLabel,
    class: className,
  }: Props = $props();

  let visible = $state(false);
</script>

<FormLabel>{label}</FormLabel>
<div class="relative">
  <Input
    {...props}
    type={visible ? "text" : "password"}
    {placeholder}
    {autocomplete}
    bind:value
    class={cn("pr-10", className)}
  />
  <button
    type="button"
    onclick={() => (visible = !visible)}
    class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
    aria-label={visible ? hideLabel : showLabel}
  >
    {#if visible}
      <EyeOff class="h-4 w-4" />
    {:else}
      <Eye class="h-4 w-4" />
    {/if}
  </button>
</div>
