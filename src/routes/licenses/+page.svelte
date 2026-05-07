<script lang="ts">
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import UploadIcon from '@lucide/svelte/icons/upload';
import Modal from '$lib/components/modal.svelte';
import Combobox from '$lib/components/product-combobox.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import * as Field from '$lib/components/ui/field/index.js';
import Input from '$lib/components/ui/input/input.svelte';
import { m } from '$lib/paraglide/messages.js';

// Add Database Connection
const products = [{ value: 'example1', label: 'example2' }];

let open = $state(false);
let productValue = $state('');
let usageVolume = $state(1);

function addLicense() {
  // Add Database Connection
  open = false;
}
</script>

<svelte:head>
    <title>{m.licenses_popup_add_meta_title()}</title>
    <meta
        name="licenses"
        content={m.meta_description()}
    />
</svelte:head>

<Button onclick={() => (open = true)}>
    <UploadIcon />
    {m.licenses_upload_button()}
</Button>

<Modal bind:open class="bg-white text-black h-auto">
    <div class="w-full max-w-md">
        <Field.Set class="gap-6">
            <Field.Group class="gap-1">
                <Field.Legend class="mb-0 pb-1">{m.licenses_popup_add_legend()}</Field.Legend>
                <Field.Description class="text-xs text-muted-foreground"
                    >{m.licenses_popup_add_description()}</Field.Description
                >
            </Field.Group>
            <Field.Separator class="-mx-6" />
            <Field.Group class="gap-5">
                <Field.Field class="gap-2">
                    <Field.Label for="productname"
                        >{m.licenses_popup_add_product_label()} <span class="text-red-600">*</span
                        ></Field.Label
                    >
                    <Combobox
                        id="productname"
                        bind:value={productValue}
                        options={products}
                        placeholder={m.licenses_popup_add_product_placeholder()}
                        contentClass="w-full"
                        class="cursor-pointer"
                    />
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="usagevolume"
                        >{m.licenses_popup_add_usage_volume_label()} <span class="text-destructive">*</span
                        ></Field.Label
                    >
                    <div class="border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3 flex h-10 overflow-hidden rounded-md border shadow-xs">
                        <input
                            id="usagevolume"
                            type="number"
                            min="0"
                            bind:value={usageVolume}
                            class="w-full min-w-0 bg-transparent px-2.5 py-1 text-base outline-none md:text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <div class="flex flex-col p-1 hight-10">
                            <button
                                type="button"
                                onclick={() => usageVolume++}
                                class="flex flex-1 items-center justify-center px-2 text-sm leading-none text-muted-foreground cursor-pointer"
                                aria-label={m.common_increase()}
                            ><PlusIcon class="size-4" /></button>
                            <button
                                type="button"
                                onclick={() => usageVolume = Math.max(0, usageVolume - 1)}
                                class="flex flex-1 items-center justify-center px-2 text-sm leading-none text-muted-foreground cursor-pointer"
                                aria-label={m.common_decrease()}
                            ><MinusIcon class="size-4" /></button>
                        </div>
                    </div>
                    <Field.Description class="text-xs text-muted-foreground"
                        >{m.licenses_popup_add_usage_volume_description()}</Field.Description
                    >
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="key"
                        >{m.licenses_popup_add_key_label()} <span class="text-destructive">*</span
                        ></Field.Label
                    >
                    <Input
                        id="key"
                        type="text"
                        placeholder={m.licenses_popup_add_key_placeholder()}
                    />
                </Field.Field>
                <div class="flex justify-between gap-3">
                    <Button
                        variant="secondary"
                        class="flex-1"
                        onclick={() => (open = false)}>{m.licenses_popup_add_cancel()}</Button
                    >
                    <Button class="flex-1" onclick={addLicense}
                        >{m.licenses_popup_add_submit()}</Button
                    >
                </div>
            </Field.Group>
        </Field.Set>
    </div>
</Modal>
