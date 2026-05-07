<script lang="ts">
import CheckIcon from '@lucide/svelte/icons/check';
import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { tick } from 'svelte';
import * as Command from '$lib/components/ui/command/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import { Button } from '$lib/components/ui/button/index.js';
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
let triggerRef = $state<HTMLButtonElement | undefined>(undefined);

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
      <Button
        {...props}
        {id}
        variant="outline"
        class={cn("w-full justify-between text-left", className)}
        role="combobox"
        aria-expanded={open}
      >
        {selectedValue || placeholder}
        <ChevronsUpDownIcon class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class={cn("w-full p-0", contentClass)}>
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
