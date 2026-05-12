<script lang="ts">
  import type { Snippet } from "svelte";

  import * as Dialog from "$lib/components/ui/dialog";
  import { Separator } from "$lib/components/ui/separator";
  import { cn } from "$lib/utils.js";

  interface Props {
    open?: boolean;
    title: string;
    description?: Snippet;
    trigger?: Snippet;
    triggerClass?: string;
    triggerDisabled?: boolean;
    triggerTitle?: string;
    children: Snippet;
    class?: string;
  }

  let {
    open = $bindable(false),
    title,
    description,
    trigger,
    triggerClass,
    triggerDisabled,
    triggerTitle,
    children,
    class: className,
  }: Props = $props();
</script>

<Dialog.Root bind:open>
  {#if trigger}
    <Dialog.Trigger type="button" class={triggerClass} title={triggerTitle} disabled={triggerDisabled}>
      {@render trigger()}
    </Dialog.Trigger>
  {/if}
  <Dialog.Content class={cn("shadow-xl ring-0 sm:max-w-106.25", className)}>
    <div class="grid gap-6">
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        {#if description}
          <Dialog.Description>
            {@render description()}
          </Dialog.Description>
        {/if}
      </Dialog.Header>
      <div class="-mx-6 -mt-2"><Separator /></div>
      {@render children()}
    </div>
  </Dialog.Content>
</Dialog.Root>
