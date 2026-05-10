<script setup lang="ts">
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { TablesInsert, TablesUpdate } from "~/types/supabase";

const UButton = resolveComponent("UButton");
const UInput = resolveComponent("UInput");

const { allowEdit = true } = defineProps<{
  allowEdit?: boolean;
}>();

type ServiceItem =
  | TablesInsert<"VehicleServiceLogsItems">
  | TablesUpdate<"VehicleServiceLogsItems">;
const service = defineModel<
  TablesInsert<"VehicleServiceLogs"> | TablesUpdate<"VehicleServiceLogs">
>({ required: true });

const serviceItems = defineModel<ServiceItem[]>("serviceItems", {
  required: true,
});

const handleAddItem = () => {
  serviceItems.value.push({
    cost: 0,
    description: "",
    quantity: 1,
  } as TablesInsert<"VehicleServiceLogsItems">);
};

const handleRemoveItem = (id: ServiceItem["id"]) => {
  if (!id) return;

  serviceItems.value = serviceItems.value.filter((item) => item.id !== id);
};

const formatCostOptions: Intl.NumberFormatOptions = {
  style: "currency",
  currency: service.value?.currency || "EUR",
  currencyDisplay: "narrowSymbol",
  compactDisplay: "short",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
};

const columns = computed<TableColumn<ServiceItem>[]>(() => {
  const cols: TableColumn<ServiceItem>[] = [
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "cost",
      cell: ({ row }) => {
        const cost = Number.parseFloat(row.getValue("cost"));

        return formatNumber(cost, formatCostOptions);
      },
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Cost",
          icon: isSorted
            ? isSorted === "asc"
              ? "mdi:sort-ascending"
              : "mdi:sort-descending"
            : "mdi:sort",
          class: "-mx-2.5",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        });
      },
      footer: ({ column }) => {
        const total = column
          .getFacetedRowModel()
          .rows.reduce(
            (acc: number, row: TableRow<ServiceItem>) =>
              acc + Number.parseFloat(row.getValue("cost")),
            0,
          );

        return formatNumber(total, formatCostOptions);
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();

        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Quantity",
          icon: isSorted
            ? isSorted === "asc"
              ? "mdi:sort-ascending"
              : "mdi:sort-descending"
            : "mdi:sort",
          class: "-mx-2.5",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
        });
      },
      footer: ({ column }) => {
        const total = column
          .getFacetedRowModel()
          .rows.reduce(
            (acc: number, row: TableRow<ServiceItem>) =>
              acc + Number.parseFloat(row.getValue("quantity")),
            0,
          );

        return total;
      },
    },
  ];

  if (allowEdit) {
    cols.push({
      id: "action",
    });
  }

  return cols;
});
</script>

<template>
  <div class="flex-1 divide-y divide-accented w-full">
    <div
      v-if="allowEdit"
      class="flex items-center gap-2 px-4 py-3.5 overflow-x-auto"
    >
      <UButton label="Add Item" icon="mdi:plus" @click="handleAddItem" />
    </div>

    <UTable :columns="columns" :data="serviceItems">
      <template v-if="allowEdit" #description-cell="{ row }">
        <UInput
          v-model="row.original.description"
          type="text"
          size="sm"
          variant="none"
        />
      </template>
      <template v-if="allowEdit" #cost-cell="{ row }">
        <UInputNumber
          v-model="row.original.cost"
          size="sm"
          variant="none"
          :formatOptions="formatCostOptions"
        />
      </template>
      <template v-if="allowEdit" #quantity-cell="{ row }">
        <UInput
          v-model="row.original.quantity"
          type="number"
          size="sm"
          variant="none"
        />
      </template>

      <template v-if="allowEdit" #action-cell="{ row }">
        <UButton
          variant="soft"
          color="error"
          icon="mdi:trash"
          aria-label="Delete row"
          @click="handleRemoveItem(row.original.id)"
        />
      </template>
    </UTable>
  </div>
</template>
