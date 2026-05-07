<script lang="ts">
import { enhance } from '$app/forms';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Select from '$lib/components/ui/select/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';

let firstName = 'David';
let lastName = 'Park';
</script>

<Dialog.Root>
    <form>
        <Dialog.Trigger
            type="button"
            class={buttonVariants({ variant: "outline" })}
        >
            Delete User
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>Delete User</Dialog.Title>
                <Dialog.Description>
                    Remove {firstName}
                    {lastName} from portal
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="grid gap-3">
                    <h3>Effects of this action</h3>
                    <ul class="text-xs text-gray-500">
                        <li>- {firstName} will no longer be able to join</li>
                        <li>
                            - {firstName} can't access any of his/her license keys
                            anymore
                        </li>
                        <li>
                            - all licensed keys from David will be available for
                            other users
                        </li>
                        <li>
                            - {firstName} will remain in the reports and history
                        </li>
                    </ul>
                </div>
                <div class="grid gap-3"></div>
            </div>
            <Dialog.Footer>
                <Dialog.Close
                    type="button"
                    class={buttonVariants({ variant: "outline" })}
                >
                    Cancel
                </Dialog.Close>
                <Button type="submit" class="bg-red-500 hover:bg-red-600"
                    >Delete</Button
                >
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>
