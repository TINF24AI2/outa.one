<script lang="ts">
  import { KeyIcon, Trash2, UploadIcon } from "@lucide/svelte";

  import * as Table from "$lib/components/ui/table/index.js";

  import EditProduct from "./edit-product.svelte";

  const products = [
    {
      productName: "Adobe",
      description: "Hier könnte ihre Beschreibung stehen!",
      requestApproval: true,
      licenceType: "Subscription",
      totalKeys: 2,
      keysUsed: 1,
    },
  ];

  // placeholder for connection for database
  // let products = getProducts();

  /* 
    functions to implement:
    toLicenceView() => Direct link to the license view filter by this product
    toLicenceUpload() => Direct link to the license view with the upload license keys pop-up open
    editProduct()
    deleteproduct()
    */
</script>

<Table.Root class="m-1">
  <Table.Header class="bg-gray-100">
    <Table.Row>
      <Table.Head>Product Name</Table.Head>
      <Table.Head>Licence Type</Table.Head>
      <Table.Head>Total Keys</Table.Head>
      <Table.Head>Keys Used</Table.Head>
      <Table.Head>Keys Available</Table.Head>
      <Table.Head>Actions</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each products as product (product)}
      <Table.Row>
        <Table.Cell class="font-medium">{product.productName}</Table.Cell>
        <Table.Cell>{product.licenceType}</Table.Cell>
        <Table.Cell>{product.totalKeys}</Table.Cell>
        <Table.Cell>{product.keysUsed}</Table.Cell>
        <Table.Cell>{product.totalKeys - product.keysUsed}</Table.Cell>

        <Table.Cell>
          <KeyIcon class="m-auto inline-flex"></KeyIcon>
          <UploadIcon class="m-auto inline-flex"></UploadIcon>
          <EditProduct></EditProduct>
          <Trash2 class="m-auto inline-flex" color="red"></Trash2>
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
