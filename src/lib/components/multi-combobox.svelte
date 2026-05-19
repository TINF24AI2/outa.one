<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { m } from "$lib/paraglide/messages.js";
  import { cn } from "$lib/utils.js";

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    options: Option[];
    placeholder?: string;
    values?: string[];
    class?: string;
    contentClass?: string;
  }

  let {
    options,
    placeholder = m.common_select_placeholder(),
    values = $bindable([]),
    class: className,
    contentClass,
  }: Props = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement | null>(null);

  const triggerLabel = $derived(
    values.length === 0
      ? null
      : values.length === 1
        ? (options.find((o) => o.value === values[0])?.label ?? null)
        : m.common_selected_count({ count: values.length }),
  );

  function toggle(value: string) {
    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
    } else {
      values = [...values, value];
    }
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <button
        {...props}
        role="combobox"
        aria-expanded={open}
        class={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-expanded:border-ring aria-expanded:ring-ring/50 dark:bg-input/30 flex h-10 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 aria-expanded:ring-3 md:text-sm",
          !triggerLabel && "text-muted-foreground",
          className,
        )}
      >
        {triggerLabel || placeholder}
        <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content style="width: var(--bits-floating-anchor-width)" class={cn("p-0", contentClass)}>
    <Command.Root>
      <Command.Input placeholder={m.common_search_placeholder()} />
      <Command.List>
        <Command.Empty>{m.common_no_option()}</Command.Empty>
        <Command.Group>
          {#each options as option (option.value)}
            <Command.Item value={option.value} keywords={[option.label]} onSelect={() => toggle(option.value)}>
              <CheckIcon class={cn(!values.includes(option.value) && "text-transparent")} />
              {option.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
