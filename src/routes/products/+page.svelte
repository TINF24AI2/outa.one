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
import { m } from '$lib/paraglide/messages.js';

let open = $state(false);
let maxLicenses = $state<number | undefined>(undefined);

function addProduct() {
  // Add Database Connection
  open = false;
}
</script>

<svelte:head>
    <title>{m.products_meta_title()}</title>
    <meta name="products" content={m.meta_description()} />
</svelte:head>

<Button onclick={() => (open = true)}>
    <PlusIcon />
    {m.products_add_button()}
</Button>

<Modal bind:open class="bg-white text-black h-auto">
    <div class="w-full max-w-md">
        <Field.Set class="gap-6">
            <Field.Legend>{m.products_popup_add_create_legend()}</Field.Legend>
            <Field.Separator class="-mx-6" />
            <Field.Group class="gap-5">
                <Field.Field class="gap-2">
                    <Field.Label for="productname"
                        >{m.products_popup_add_name_label()} <span class="text-destructive">*</span
                        ></Field.Label
                    >
                    <Input id="productname" type="text" placeholder={m.products_popup_add_name_placeholder()} />
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="description">{m.products_popup_add_description_label()}</Field.Label>
                    <Textarea id="description" class="resize-none" placeholder={m.products_popup_add_description_placeholder()}></Textarea>
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="maxlicenses">{m.products_popup_add_max_licenses_label()}</Field.Label>
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
                                aria-label={m.common_increase()}
                            ><PlusIcon class="size-4" /></button>
                            <button
                                type="button"
                                onclick={() => maxLicenses = Math.max(0, (maxLicenses ?? 0) - 1)}
                                class="flex flex-1 items-center justify-center px-2 text-sm leading-none text-muted-foreground cursor-pointer"
                                aria-label={m.common_decrease()}
                            ><MinusIcon class="size-4" /></button>
                        </div>
                    </div>
                    <Field.Description class="text-xs text-muted-foreground"
                        >{m.products_popup_add_max_licenses_description()}</Field.Description
                    >
                </Field.Field>
                <Field.Field class="flex-row align-center gap-2">
                    <div class="flex-col">
                        <Label for="reqapproval" class="pb-1">{m.products_popup_add_requires_approval_label()}</Label>
                        <Description class="text-xs text-muted-foreground"
                            >{m.products_popup_add_requires_approval_description()}</Description
                        >
                    </div>
                    <Switch id="reqapproval" class="self-center"></Switch>
                </Field.Field>
                <div class="flex justify-between gap-3">
                    <Button
                        variant="secondary"
                        class="flex-1 "
                        onclick={() => (open = false)}>{m.products_popup_add_cancel()}</Button
                    >
                    <Button class="flex-1" onclick={addProduct}
                        >{m.products_popup_add_submit()}</Button
                    >
                </div>
            </Field.Group>
        </Field.Set>
    </div>
</Modal>
