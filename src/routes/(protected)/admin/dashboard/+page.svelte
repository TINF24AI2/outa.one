<script lang="ts">
  import { Activity, ClipboardList, FileKey, Package, Plus, Upload } from "@lucide/svelte";
  import { resolve } from "$app/paths";

  import PageHeader from "$lib/components/app/page-header.svelte";
  import { m } from "$lib/paraglide/messages";

  let { data } = $props();
</script>

<svelte:head>
  <title>{m.dashboard_meta_title()}</title>
  <meta name="dashboard" content={m.meta_description()} />
</svelte:head>

<div class="flex h-full w-full flex-col overflow-hidden">
  <PageHeader title={m.admin_dashboard()} subtitle={m.admin_dashboard_subtile()}></PageHeader>
  <div class="mx-auto w-full max-w-7xl flex-1 space-y-8 overflow-auto px-4 py-6 sm:px-6">
    <div class="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <a
        href={resolve("/admin/licenses")}
        class="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:p-6"
      >
        <div
          class="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 transition-colors group-hover:bg-blue-200 sm:mb-4 sm:h-10 sm:w-10"
        >
          <FileKey class="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_total_licenses()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.totalLicenses}</p>
      </a>

      <a
        href={resolve("/admin/licenses")}
        class="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-orange-300 hover:bg-orange-50 sm:p-6"
      >
        <div
          class="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-orange-100 transition-colors group-hover:bg-orange-200 sm:mb-4 sm:h-10 sm:w-10"
        >
          <Activity class="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_lisences_in_use()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.licensesInUse}</p>
      </a>

      <a
        href={resolve("/admin/licenses")}
        class="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-green-300 hover:bg-green-50 sm:p-6"
      >
        <div
          class="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-green-100 transition-colors group-hover:bg-green-200 sm:mb-4 sm:h-10 sm:w-10"
        >
          <FileKey class="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_available_lisences()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.availableLicenses}</p>
      </a>

      <a
        href={resolve("/admin/products")}
        class="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-purple-300 hover:bg-purple-50 sm:p-6"
      >
        <div
          class="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 transition-colors group-hover:bg-purple-200 sm:mb-4 sm:h-10 sm:w-10"
        >
          <Package class="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_total_products()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.totalProducts}</p>
      </a>

      <a
        href={resolve("/admin/requests")}
        class="group col-span-2 flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-orange-300 hover:bg-orange-50 sm:p-6 lg:col-span-1"
      >
        <div
          class="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-orange-100 transition-colors group-hover:bg-orange-200 sm:mb-4 sm:h-10 sm:w-10"
        >
          <ClipboardList class="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
        </div>
        <p class="text-xs text-gray-500 sm:text-sm">{m.admin_dashboard_pending_requests()}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{data.pendingRequests}</p>
      </a>
    </div>

    <div class="w-full">
      <p class="mb-4 text-xl font-semibold">{m.admin_dashboard_quick_actions()}</p>
      <div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <a
          href={resolve("/admin/licenses?add=1")}
          class="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:p-5"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-100">
            <Upload class="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-900">{m.admin_dashboard_upload_license_keys()}</p>
            <p class="text-sm text-gray-500">{m.admin_dashboard_upload_license_keys_subtitle()}</p>
          </div>
        </a>

        <a
          href={resolve("/admin/products?add=1")}
          class="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:p-5"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-100">
            <Plus class="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-900">{m.admin_dashboard_add_product()}</p>
            <p class="text-sm text-gray-500">{m.admin_dashboard_add_product_subtitle()}</p>
          </div>
        </a>

        <!-- View reports — not yet implemented -->
        <!-- <div class="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-100">
            <ChartColumn class="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p class="text-base font-medium text-gray-900">{m.admin_dashboard_view_reports()}</p>
            <p class="text-sm text-gray-500">{m.admin_dashboard_view_reports_subtitle()}</p>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Recent activity — not yet implemented -->
    <!-- <div>
      <p class="mb-4 text-xl font-semibold">{m.admin_dashboard_recent_activity()}</p>
    </div> -->
  </div>
</div>
