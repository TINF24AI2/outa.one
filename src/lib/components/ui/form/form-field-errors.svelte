<script lang="ts">
  import { FieldErrors } from "formsnap";
  import type { FieldErrorsProps } from "formsnap";

  import { cn } from "$lib/utils.js";

  let { class: className, ...restProps }: Omit<FieldErrorsProps, "children"> = $props();
</script>

<FieldErrors {...restProps}>
  {#snippet children({ errors, errorProps })}
    {#each errors as error, i (i)}
      <p {...errorProps} class={cn("text-destructive text-sm font-medium", className)}>{error}</p>
    {/each}
  {/snippet}
</FieldErrors>
