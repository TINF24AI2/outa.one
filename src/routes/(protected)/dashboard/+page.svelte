<script lang="ts">
import { enhance } from '$app/forms';
import Sidebar from '$lib/components/app/sidebar.svelte';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

const isAdmin = $derived(data.user.role === 'admin');

let inviteLoading = $state(false);
let inviteEmail = $state('');
</script>

<div class="flex h-screen overflow-hidden">
  <Sidebar user={data.user} />

  <!-- THIS IS FOR TESTING INVITES - THIS IS A TEMPORARY SOLUTION -->
  <main>
    {#if isAdmin}
      <div>
        <form
          method="post"
          action="?/generateInvite"
          use:enhance={() => {
            inviteLoading = true;
            return async ({ update }) => {
              inviteLoading = false;
              inviteEmail = '';
              await update();
            };
          }}
        >
          <div>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder="user@company.com"
              bind:value={inviteEmail}
            />
          </div>
          <label>
            <input type="checkbox" name="grantAdmin" class="rounded" />
            admin rights
          </label>
          <Button type="submit" disabled={inviteLoading} class="w-fit">
            {inviteLoading ? 'Generating…' : 'Generate invite link'}
          </Button>
        </form>

        {#if form?.inviteUrl}
          <div class="mt-4 rounded-lg border bg-white p-3 text-sm">
            <p class="text-muted-foreground mb-1 text-xs">
              Invite link for {form.email}
              {#if form.role === 'admin'}<span class="text-primary font-medium">(admin)</span>{/if}:
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
