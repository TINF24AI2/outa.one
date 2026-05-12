<script lang="ts">
  import { getInitials } from "$lib/user-management";
  import { cn } from "$lib/utils";

  type Props = {
    name: string;
    class?: string;
  };

  let { name, class: className }: Props = $props();
</script>

<div
  class={cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700",
    className,
  )}
>
  {getInitials(name)}
</div>
