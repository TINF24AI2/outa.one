<script lang="ts">
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import Modal from '$lib/components/modal.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { Description } from '$lib/components/ui/dialog';
import * as Field from '$lib/components/ui/field/index.js';
import Input from '$lib/components/ui/input/input.svelte';
import Label from '$lib/components/ui/label/label.svelte';
import Switch from '$lib/components/ui/switch/switch.svelte';
import Textarea from '$lib/components/ui/textarea/textarea.svelte';

let open = $state(false);
let maxLicenses = $state<number | undefined>(undefined);

function addProduct() {
  // Add Database Connection
  open = false;
}
</script>

<svelte:head>
    <title>Outa - Products</title>
    <meta name="producs" content="Self service software license keys portal." />
</svelte:head>

<Button onclick={() => (open = true)}>
    <PlusIcon />
    Add new Product
</Button>

<Modal bind:open class="bg-white text-black h-auto">
    <div class="w-full max-w-md">
        <Field.Set class="gap-6">
            <Field.Legend>Create Product</Field.Legend>
            <Field.Separator class="-mx-6" />
            <Field.Group class="gap-5">
                <Field.Field class="gap-2">
                    <Field.Label for="productname"
                        >Product Name <span class="text-destructive">*</span
                        ></Field.Label
                    >
                    <Input id="productname" type="text" placeholder="e.g., Adobe Creative Cloud" />
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="description">Description</Field.Label>
                    <Textarea id="description" class="resize-none" placeholder="Brief description of the product..."></Textarea>
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="maxlicenses">Max Licenses per User</Field.Label>
                    <div class="border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3 flex h-10 overflow-hidden rounded-md border shadow-xs">
                        <input
                            id="maxlicenses"
                            type="number"
                            min="0"
                            bind:value={maxLicenses}
                            class="w-full min-w-0 bg-transparent px-2.5 py-1 text-base outline-none md:text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <div class="flex flex-col p-1">
                            <button
                                type="button"
                                onclick={() => maxLicenses = (maxLicenses ?? 0) + 1}
                                class="flex flex-1 items-center justify-center px-2 text-sm leading-none text-muted-foreground cursor-pointer"
                                aria-label="Increase"
                            ><PlusIcon class="size-4" /></button>
                            <button
                                type="button"
                                onclick={() => maxLicenses = Math.max(0, (maxLicenses ?? 0) - 1)}
                                class="flex flex-1 items-center justify-center px-2 text-sm leading-none text-muted-foreground cursor-pointer"
                                aria-label="Decrease"
                            ><MinusIcon class="size-4" /></button>
                        </div>
                    </div>
                    <Field.Description class="text-xs text-muted-foreground"
                        >How many keys one user can aquire</Field.Description
                    >
                </Field.Field>
                <Field.Field class="flex-row align-center gap-2">
                    <div class="flex-col">
                        <Label for="reqapproval" class="pb-1">Requires Approval</Label>
                        <Description class="text-xs text-muted-foreground"
                            >Lisence requests need admin approval before
                            assignment</Description
                        >
                    </div>
                    <Switch id="reqapproval" class="self-center"></Switch>
                </Field.Field>
                <div class="flex justify-between gap-3">
                    <Button
                        variant="secondary"
                        class="flex-1 "
                        onclick={() => (open = false)}>Cancel</Button
                    >
                    <Button class="flex-1" onclick={addProduct}
                        >Add Product</Button
                    >
                </div>
            </Field.Group>
        </Field.Set>
    </div>
</Modal>
