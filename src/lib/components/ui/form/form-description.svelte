<script lang="ts">
  import { Description } from "formsnap";
  import type { DescriptionProps } from "formsnap";

  import { cn } from "$lib/utils.js";

  let { class: className, ...restProps }: DescriptionProps = $props();
</script>

<Description class={cn("text-muted-foreground text-sm", className)} {...restProps} />
