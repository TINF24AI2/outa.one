<script lang="ts">
import logo from '$lib/assets/logo.svg';
</script>

<svelte:head>
  <title>Outa - Welcome</title>
  <meta
    name="description"
    content="Self service software license keys portal."
  />
</svelte:head>

<div class="min-h-screen bg-slate-50/30 px-4 py-8 sm:px-6 lg:px-8">
  <main
    class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center"
  >
    <section
      class="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-col items-center justify-center gap-8 text-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 ring-1 ring-white/20"
        >
          <img src={logo} alt="Logo" class="h-9 w-9 object-contain" />
        </div>

        <div class="min-w-0">
          <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p class="mt-2 text-sm text-gray-500">
            A self-service software license keys portal is being created here
          </p>
        </div>
      </div>
    </section>
  </main>
</div>
