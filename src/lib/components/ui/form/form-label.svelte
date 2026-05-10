<script lang="ts">
  import { Label } from "formsnap";
  import type { LabelProps } from "formsnap";

  import { cn } from "$lib/utils.js";

  let { class: className, ...restProps }: LabelProps = $props();
</script>

<Label
  class={cn("text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
  {...restProps}
/>
