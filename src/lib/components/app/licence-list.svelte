<script lang="ts">
  import Table from "../ui/table/table.svelte";

  let { licenses }: Props = $props();
</script>

<div class="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6 sm:px-6">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div class="hidden sm:block">
      <Table.Root>
        <Table.Header class="bg-slate-50">
          <Table.Row class="[&>th]:text-neutral-500">
            <Table.HeaderCell>Product Name</Table.HeaderCell>
            <Table.HeaderCell>Licence Key</Table.HeaderCell>
            <Table.HeaderCell>Date Assigned</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each licenses as license (license.id)}
            <Table.Row>
              <Table.Cell>{license.productName}</Table.Cell>
              <Table.Cell>{license.licenceKey}</Table.Cell>
              <Table.Cell>{new Date(license.requestedAt).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{license.status}</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
</div>
