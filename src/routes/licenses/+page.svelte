<script lang="ts">
import upload from '$lib/assets/upload.svg';
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
        src={upload}
        alt="Upload"
        class="inline-block w-4 h-4 mr-2 text-white"
        style="filter: brightness(0) invert(1);"
    />
    Upload Keys
</Button>

<Modal bind:open class="bg-slate-900 text-white h-auto">
    <div class="w-full max-w-md">
        <Field.Set>
            <Field.Legend>Add License</Field.Legend>
            <Field.Group>
                <Field.Field>
                    <Field.Label for="productname">Product Name *</Field.Label>
                    <Input id="productname" type="text" />
                </Field.Field>
                <Field.Field>
                    <Field.Label for="usagevolume">Usage Volume *</Field.Label>
                    <Input id="usagevolumen" type="number" />
                    <Field.Description
                        >How often this key can be used. Set to 0 for unlimited.</Field.Description
                    >
                </Field.Field>
                <Field.Field>
                    <Field.Label for="key">Key *</Field.Label>
                    <Input id="key" type="text" />
                </Field.Field>
                <Field.Field class="">
                    <Button>Cancel</Button>
                    <Button>Add Lisencse</Button>
                </Field.Field>
            </Field.Group>
        </Field.Set>
    </div>
</Modal>
