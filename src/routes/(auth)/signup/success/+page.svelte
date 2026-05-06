<script lang="ts">
import { CircleCheckBig } from '@lucide/svelte';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { Card, CardContent } from '$lib/components/ui/card';
import { m } from '$lib/paraglide/messages.js';

let countdown = $state(5);

onMount(() => {
  const interval = setInterval(() => {
    countdown -= 1;
    if (countdown <= 0) {
      clearInterval(interval);
      goto('/login');
    }
  }, 1000);
  return () => clearInterval(interval);
});
</script>

<div
  class="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12"
>
  <Card class="w-full max-w-sm">
    <CardContent class="flex flex-col items-center gap-5 py-10 text-center">
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
      >
        <CircleCheckBig class="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h1 class="text-xl font-semibold">{m.auth_signup_success_title()}</h1>
        <p class="text-muted-foreground mt-2 text-sm">
          {m.auth_signup_success_description()}
        </p>
      </div>

      <p class="text-muted-foreground text-sm">
        {m.auth_signup_success_redirecting({ countdown })}
      </p>
    </CardContent>
  </Card>
</div>
