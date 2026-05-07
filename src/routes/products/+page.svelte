<script lang="ts">
import { Button } from '$lib/components/ui/button/index.js';
import * as Field from '$lib/components/ui/field/index.js';
import Input from '$lib/components/ui/input/input.svelte';
import plus from '$lib/assets/plus.svg';
import Modal from '$lib/components/modal.svelte';
import Label from '$lib/components/ui/label/label.svelte';
import Switch from '$lib/components/ui/switch/switch.svelte';
import Textarea from '$lib/components/ui/textarea/textarea.svelte';
import { Description } from '$lib/components/ui/dialog';
let open = $state(false);

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
    <img
        src={plus}
        alt="Add"
        class="inline-block w-4 h-4 mr-2 text-white"
        style="filter: brightness(0) invert(1);"
    />
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
                    <Input id="productname" type="text" />
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="description">Description</Field.Label>
                    <Textarea id="description" class="resize-none"></Textarea>
                </Field.Field>
                <Field.Field class="gap-2">
                    <Field.Label for="maxlicenses"
                        >Max Licenses per User<span class="text-destructive"
                            >*</span
                        ></Field.Label
                    >
                    <Input id="maxlicenses" type="number" />
                    <Field.Description
                        >How many keys one user can aquire.</Field.Description
                    >
                </Field.Field>
                <Field.Field class="flex-row align-center gap-2">
                    <div class="flex-col">
                        <Label for="reqapproval">Requires Approval</Label>
                        <Description
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
