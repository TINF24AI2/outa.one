<script lang="ts">
import { enhance } from '$app/forms';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import * as Dialog from '$lib/components/ui/dialog/index.js';
import * as Select from '$lib/components/ui/select/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { Label } from '$lib/components/ui/label/index.js';
import { m } from '$lib/paraglide/messages';

let firstName = 'David';
let lastName = 'Park';
</script>

<Dialog.Root>
    <form>
        <Dialog.Trigger
            type="button"
            class={buttonVariants({ variant: "outline" })}
        >
            {m.users_delete_dialog_title()}
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
                <Dialog.Title>{m.users_delete_dialog_title()}</Dialog.Title>
                <Dialog.Description>
                    {m.users_delete_dialog_description({ firstName, lastName })}
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="grid gap-3">
                    <h3>{m.users_delete_effects_title()}</h3>
                    <ul class="text-xs text-gray-500">
                        <li>- {m.users_delete_effect_no_access({ firstName })}</li>
                        <li>
                            - {m.users_delete_effect_no_licenses({ firstName })}
                        </li>
                        <li>
                            - {m.users_delete_effect_keys_freed({ firstName })}
                        </li>
                        <li>
                            - {m.users_delete_effect_remains_in_history({ firstName })}
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
                    {m.users_dialog_cancel()}
                </Dialog.Close>
                <Button type="submit" class="bg-red-500 hover:bg-red-600"
                    >{m.users_delete_submit()}</Button
                >
            </Dialog.Footer>
        </Dialog.Content>
    </form>
</Dialog.Root>
