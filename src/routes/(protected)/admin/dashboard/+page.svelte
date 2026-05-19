<script lang="ts">
  import { Activity, ChartColumn, ClipboardList, FileKey, Package, Plus, Upload } from "@lucide/svelte";
  import { resolve } from "$app/paths";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import { m } from "$lib/paraglide/messages";
</script>

<svelte:head>
  <title>{m.dashboard_meta_title()}</title>
  <meta name="dashboard" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.admin_dashboard()} subtitle={m.admin_dashboard_subtile()}></PageHeader>
  <div class="mx-auto w-full max-w-7xl flex-1 space-y-8 overflow-auto px-4 py-6 sm:px-6">
    <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
      <div class="h-40 rounded-sm border border-gray-200 bg-white p-6" style="min-width:220px">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
          <FileKey class="h-5 w-5 text-blue-400" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_total_licenses()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">1</p>
      </div>
      <div class="h-40 w-full rounded-sm border border-gray-200 bg-white p-6" style="min-width:220px">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-orange-100">
          <Activity class="h-5 w-5 text-orange-400" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_lisences_in_use()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">1</p>
      </div>
      <div class="h-40 rounded-sm border border-gray-200 bg-white p-6" style="min-width:220px">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
          <FileKey class="h-5 w-5 text-green-400" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_available_lisences()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">1</p>
      </div>
      <div class="h-40 rounded-sm border border-gray-200 bg-white p-6" style="min-width:220px">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-purple-100">
          <Package class="h-5 w-5 text-purple-400" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_total_products()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">1</p>
      </div>
      <div class="h-40 w-full rounded-sm border border-gray-200 bg-white p-6" style="min-width:220px">
        <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-orange-100">
          <ClipboardList class="h-5 w-5 text-orange-400" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_pending_requests()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">1</p>
      </div>
    </div>
    <div class="w-full">
      <p class="mb-4 text-xl font-semibold">{m.admin_dashboard_quick_actions()}</p>
      <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 sm:gap-4">
        <a href={resolve("/admin/licenses?add=1")} class="flex gap-3 rounded-lg border bg-white p-3 sm:p-5">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
            <Upload class="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-900">{m.admin_dashboard_upload_license_keys()}</p>
            <p class="text-sm text-gray-500">{m.admin_dashboard_upload_license_keys_subtitle()}</p>
          </div>
        </a>
        <a href={resolve("/admin/products?add=1")} class="flex gap-3 rounded-lg border bg-white p-3 sm:p-5">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
            <Plus class="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-900">{m.admin_dashboard_add_product()}</p>
            <p class="text-sm text-gray-500">{m.admin_dashboard_add_product_subtitle()}</p>
          </div>
        </a>
        <div class="flex gap-3 rounded-lg border bg-white p-3 sm:p-5">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
            <ChartColumn class="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-900">{m.admin_dashboard_view_reports()}</p>
            <p class="text-sm text-gray-500">{m.admin_dashboard_view_reports_subtitle()}</p>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p class="mb-4 text-xl font-semibold">{m.admin_dashboard_recent_activity()}</p>
    </div>
  </div>
</div>
