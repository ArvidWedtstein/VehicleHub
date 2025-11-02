<script setup lang="ts">
import Drawer from "~/components/Drawer.vue";
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";

const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);

const emit = defineEmits<{
  (e: "applyFilters", filters: typeof buildFilters): void;
}>();

const filterSchema: FilterSchema<"VehicleServiceLogs"> = [
  {
    column: "currency",
    label: "Currency",
    type: "multi-select",
    operator: "in",
    options: [
      { label: "Euro", value: "EUR" },
      { label: "Norwegian Krone", value: "NOK" },
    ],
  },
  {
    column: "mileage",
    label: "Mileage",
    type: "number",
  },
  {
    column: "cost",
    label: "Cost",
    type: "number",
  },
  { column: "date", label: "Date", type: "date-range" },
  { column: "notes", label: "Notes", type: "search" },
];

const { schema, filterState, buildFilters, resetFilters } =
  useFilterBuilder(filterSchema);

const applyFilters = async () => {
  console.log("filters", buildFilters.value);
  emit("applyFilters", buildFilters);
};
</script>

<template>
  <button
    class="btn btn-outline join-item"
    @click="
      () => {
        drawerRef?.open();
      }
    "
  >
    <Icon name="mdi:filter-variant" />
    Filter
  </button>

  <Drawer ref="drawerRef" title="Filter" direction="bottom">
    <NuxtLoadingIndicator />

    <FilterForm :schema="schema" :filterState="filterState" />

    <template #actions>
      <button class="btn btn-primary" @click="applyFilters">Apply</button>
      <button class="btn btn-soft" @click="resetFilters">Reset</button>
    </template>
  </Drawer>
</template>
