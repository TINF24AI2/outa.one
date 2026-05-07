<script lang="ts">
import upload from '$lib/assets/upload.svg';
import { Button } from '$lib/components/ui/button/index.js';
import * as Field from '$lib/components/ui/field/index.js';
import Input from '$lib/components/ui/input/input.svelte';
import Modal from '$lib/components/modal.svelte';
import Combobox from '$lib/components/product-combobox.svelte';

// Add Database Connection
const products = [{ value: 'example1', label: 'example2' }];

let open = $state(false);
let productValue = $state('');

function addLicense() {
  // Add Database Connection
  open = false;
}
</script>

<svelte:head>
    <title>Outa - Licenses</title>
    <meta
        name="licenses"
        content="Self service software license keys portal."
    />
</svelte:head>

<Button onclick={() => (open = true)}>
    <img
        src={upload}
        alt="Upload"
        class="inline-block w-4 h-4 mr-2 text-white"
        style="filter: brightness(0) invert(1);"
    />
    Upload Keys
</Button>

<Modal bind:open class="bg-white text-black h-auto">
    <div class="w-full max-w-md">
        <Field.Set class="gap-6">
            <Field.Group class="gap-1">
                <Field.Legend class="mb-0">Add License</Field.Legend>
                <Field.Description class="text-xs text-muted-foreground"
                    >Add a new lisence for a product</Field.Description
                >
            </Field.Group>
            <Field.Separator class="-mx-6" />
            <Field.Group class="gap-5">
                <Field.Field class="gap-2">
                    <Field.Label for="productname"
                        >Product Name <span class="text-red-600">*</span
                        ></Field.Label
                    >
                    <Combobox
                        id="productname"
                        bind:value={productValue}
                        options={products}
                        placeholder="Select a product..."
                        contentClass="w-full"
                    />
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="usagevolume"
                        >Usage Volume <span class="text-destructive">*</span
                        ></Field.Label
                    >
                    <Input
                        id="usagevolumen"
                        type="number"
                        min="0"
                        placeholder="1"
                    />
                    <Field.Description class="text-xs text-muted-foreground"
                        >How often this key can be used. Set to 0 for unlimited.</Field.Description
                    >
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="key"
                        >Key <span class="text-destructive">*</span
                        ></Field.Label
                    >
                    <Input
                        id="key"
                        type="text"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                    />
                </Field.Field>
                <div class="flex justify-between gap-3">
                    <Button
                        variant="secondary"
                        class="flex-1"
                        onclick={() => (open = false)}>Cancel</Button
                    >
                    <Button class="flex-1" onclick={addLicense}
                        >Add License</Button
                    >
                </div>
            </Field.Group>
        </Field.Set>
    </div>
</Modal>
