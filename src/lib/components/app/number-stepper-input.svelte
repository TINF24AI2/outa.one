<script lang="ts">
  import MinusIcon from "@lucide/svelte/icons/minus";
  import PlusIcon from "@lucide/svelte/icons/plus";

  import * as Field from "$lib/components/ui/field";
  import { m } from "$lib/paraglide/messages.js";

  type Props = {
    id: string;
    name: string;
    label: string;
    value?: number;
    description?: string;
    error?: string;
    required?: boolean;
    requiredIndicatorClass?: string;
    min?: number;
  };

  let {
    id,
    name,
    label,
    value = $bindable<number | undefined>(undefined),
    description,
    error,
    required = false,
    requiredIndicatorClass = "text-destructive",
    min = 0,
  }: Props = $props();

  const decrement = () => {
    value = Math.max(min, (value ?? min) - 1);
  };

  const increment = () => {
    value = (value ?? min) + 1;
  };
</script>

<Field.Field class="gap-2">
  <Field.Label for={id}>
    {label}
    {#if required}
      <span class={requiredIndicatorClass}>*</span>
    {/if}
  </Field.Label>

  <div
    class="border-input focus-within:border-ring focus-within:ring-ring/50 flex h-10 overflow-hidden rounded-md border shadow-xs focus-within:ring-3"
  >
    <input
      {id}
      {name}
      type="number"
      bind:value
      {min}
      {required}
      class="w-full min-w-0 [appearance:textfield] bg-transparent px-2.5 py-1 text-base outline-none md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />

    <div class="flex h-10 flex-col p-1">
      <button
        type="button"
        onclick={increment}
        class="text-muted-foreground flex flex-1 cursor-pointer items-center justify-center px-2 text-sm leading-none"
        aria-label={m.common_increase()}
      >
        <PlusIcon class="size-4" />
      </button>
      <button
        type="button"
        onclick={decrement}
        class="text-muted-foreground flex flex-1 cursor-pointer items-center justify-center px-2 text-sm leading-none"
        aria-label={m.common_decrease()}
      >
        <MinusIcon class="size-4" />
      </button>
    </div>
  </div>

  {#if error}
    <Field.Error>{error}</Field.Error>
  {/if}

  {#if description}
    <Field.Description class="text-muted-foreground text-xs">
      {description}
    </Field.Description>
  {/if}
</Field.Field>
