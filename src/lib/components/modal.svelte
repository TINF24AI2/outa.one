<script>
import { Button } from '$lib/components/ui/button/index.js';
import { Root as Dialog, Content as DialogContent } from '$lib/components/ui/dialog';

let { open = $bindable(false), onClose = undefined, class: className = '', children } = $props();
let previousOpen = open;

$effect(() => {
  if (previousOpen && !open) {
    previousOpen = open;
    onClose?.();
  } else if (previousOpen !== open) {
    previousOpen = open;
  }
});
</script>

<Dialog bind:open>
    <DialogContent
        class={`max-w-md bg-white text-black rounded-xl p-6 shadow-xl ${className}`}
    >
        {@render children?.()}
    </DialogContent>
</Dialog>
