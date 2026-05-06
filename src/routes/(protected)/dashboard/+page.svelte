<script lang="ts">
import { enhance } from '$app/forms';
import Navigation from '$lib/components/app/navigation.svelte';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { m } from '$lib/paraglide/messages.js';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

const isAdmin = $derived(data.user.role === 'admin');

let inviteLoading = $state(false);
let inviteEmail = $state('');
</script>

<div class="flex h-screen overflow-hidden">
  <Navigation user={data.user} />

  <!-- THIS IS FOR TESTING INVITES - THIS IS A TEMPORARY SOLUTION -->
  <main class="pb-16 md:pb-0">
    {#if isAdmin}
      <div>
        <form
          method="post"
          action="?/generateInvite"
          use:enhance={() => {
            inviteLoading = true;
            return async ({ update }) => {
              inviteLoading = false;
              inviteEmail = "";
              await update();
            };
          }}
        >
          <div>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder={m.auth_login_email_placeholder()}
              bind:value={inviteEmail}
            />
          </div>
          <label>
            <input type="checkbox" name="grantAdmin" class="rounded" />
            {m.dashboard_invite_admin_rights()}
          </label>
          <Button type="submit" disabled={inviteLoading} class="w-fit">
            {inviteLoading
              ? m.dashboard_invite_submit_loading()
              : m.dashboard_invite_submit()}
          </Button>
        </form>

        {#if form?.inviteUrl}
          <div class="mt-4 rounded-lg border bg-white p-3 text-sm">
            <p class="text-muted-foreground mb-1 text-xs">
              {m.dashboard_invite_link_label({ email: form.email ?? "" })}
              {#if form.role === "admin"}
                <span class="text-primary font-medium">
                  {m.role_admin()}
                </span>
              {/if}:
            </p>
            <p class="break-all font-mono text-xs">{form.inviteUrl}</p>
          </div>
        {/if}
        {#if form?.error}
          <p class="text-destructive mt-3 text-sm">{form.error}</p>
        {/if}
      </div>
    {/if}
  </main>
</div>
