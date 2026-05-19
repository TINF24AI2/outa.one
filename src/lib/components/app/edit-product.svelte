<script lang="ts">
import { enhance } from '$app/forms';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';
import { KeyIcon, Mail, SquarePen } from '@lucide/svelte';
import { Description } from '../ui/alert';
import Switch from '../ui/switch/switch.svelte';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];

let value = $state('');

const triggerContent = $derived(roles.find((f) => f.value === value)?.label ?? 'Select a role');

let email = 'john.doe@company.com';
</script>

<Dialog.Root>
    <form>
        <Dialog.Trigger type="button">
            <SquarePen class="inline"></SquarePen>
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>Edit Product</Dialog.Title>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="grid gap-3">
                    <Label for="name">Product Name</Label>
                    <Input id="name" type="text" required></Input>

                    <Label for="description">Description</Label>
                    <Input id="description" type="" class="h-0.5"></Input>

                    <Label for="maxPerUser">Max Licences per User</Label>
                    <Input id="maxPerUser" type="number"></Input>
                    <Dialog.Description class="text-xs"
                        >How many Keys one user can aquire
                    </Dialog.Description>

                    <lable for="approval">Requires Approval</lable>
                    <Switch id="approval" class="text-end"></Switch>
                    <Dialog.Description class="text-xs"
                        >License requests need admin approval before assignment
                    </Dialog.Description>
                </div>
            </div>
            <Dialog.Footer>
                <Dialog.Close
                    type="button"
                    class={buttonVariants({ variant: "outline" })}
                >
                    Cancel
                </Dialog.Close>
                <Button type="submit">Save Changes</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>
