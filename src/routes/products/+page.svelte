<script lang="ts">
import { Button } from '$lib/components/ui/button/index.js';
import Textarea from '$lib/components/ui/textarea/textarea.svelte';
import * as Field from '$lib/components/ui/field/index.js';
import Input from '$lib/components/ui/input/input.svelte';
import plus from '$lib/assets/plus.svg';
import Modal from '$lib/components/modal.svelte';
import Label from '$lib/components/ui/label/label.svelte';
import Switch from '$lib/components/ui/switch/switch.svelte';
import { Description } from '$lib/components/ui/dialog';
let open = $state(false);
</script>

<svelte:head>
    <title>Outa - Products</title>
    <meta name="producs" content="Self service software license keys portal." />
</svelte:head>

<Button variant="outline" onclick={() => (open = true)}>
    <img
        src={plus}
        alt="Add"
        class="inline-block w-4 h-4 mr-2 text-white"
        style="filter: brightness(0) invert(1);"
    />
    Add new Product
</Button>

<Modal bind:open class="bg-slate-900 text-white h-auto">
    <div class="w-full max-w-md">
        <Field.Set>
            <Field.Legend>Create Product</Field.Legend>
            <Field.Group>
                <Field.Field>
                    <Field.Label for="productname">Product Name</Field.Label>
                    <Input id="productname" type="text" />
                </Field.Field>
                <Field.Field>
                    <Field.Label for="description">Description</Field.Label>
                    <Input id="description" type="text" />
                </Field.Field>
                <Field.Field>
                    <Field.Label for="maxlicenses"
                        >Max Licenses per User</Field.Label
                    >
                    <Input id="maxlicenses" type="number" />
                    <Field.Description
                        >How many keys one user can aquire.</Field.Description
                    >
                </Field.Field>
                <Field.Field>
                    <Label for="reqapproval">Reqires Approval</Label>
                    <Description
                        >Lisence requests need admin approval before assignment.</Description
                    >
                    <Switch id="reqapproval"></Switch>
                </Field.Field>
                <Field.Field class="">
                    <Button>Cancel</Button>
                    <Button>Add Product</Button>
                </Field.Field>
            </Field.Group>
        </Field.Set>
    </div>
</Modal>
