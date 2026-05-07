<script lang="ts">
import CheckIcon from '@lucide/svelte/icons/check';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { tick } from 'svelte';
import * as Command from '$lib/components/ui/command/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import { cn } from '$lib/utils.js';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  placeholder?: string;
  value?: string;
  id?: string;
  class?: string;
  contentClass?: string;
  width?: string;
}

let {
  options,
  placeholder = 'Select an option...',
  value = $bindable(''),
  id,
  class: className,
  contentClass,
}: Props = $props();

let open = $state(false);
let triggerRef = $state<HTMLButtonElement>(null!);

const selectedValue = $derived(options.find((o) => o.value === value)?.label);

// We want to refocus the trigger button when the user selects
// an item from the list so users can continue navigating the
// rest of the form with the keyboard.
function closeAndFocusTrigger() {
  open = false;
  tick().then(() => {
    triggerRef?.focus();
  });
}
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <button
        {...props}
        {id}
        role="combobox"
        aria-expanded={open}
        class={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-expanded:border-ring aria-expanded:ring-ring/50 aria-expanded:ring-3 dark:bg-input/30 flex h-10 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm",
          !selectedValue && "text-muted-foreground",
          className
        )}
      >
        {selectedValue || placeholder}
        <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content style="width: var(--bits-floating-anchor-width)" class={cn("p-0", contentClass)}>
    <Command.Root>
      <Command.Input placeholder="Search..." />
      <Command.List>
        <Command.Empty>No option found.</Command.Empty>
        <Command.Group>
          {#each options as option (option.value)}
            <Command.Item
              value={option.value}
              onSelect={() => {
                value = option.value;
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon
                class={cn(value !== option.value && "text-transparent")}
              />
              {option.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
