<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    variant = "secondary",
    children,
  }: {
    variant?: "primary" | "secondary" | "success" | "warning" | "destructive";
    children: Snippet;
  } = $props();

  const variantClasses: Record<string, string> = {
    primary: "bg-blue-50 text-blue-700",
    secondary: "bg-slate-100 text-gray-700",
    success: "bg-green-50 text-green-700",
    warning: " bg-yellow-50 text-yellow-700",
    destructive: "bg-orange-50 text-orange-700",
  };
</script>

<span class={`inline-flex shrink-0 items-center rounded px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}>
  {@render children()}
</span>
