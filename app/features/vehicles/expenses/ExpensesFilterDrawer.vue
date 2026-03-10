<script setup lang="ts">
import Drawer from "~/components/Drawer.vue";
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";

const drawerRef = ref<InstanceType<typeof Drawer> | null>(null);
const open = ref(false);

const emit = defineEmits<{
  (e: "applyFilters", filters: typeof buildFilters): void;
}>();

const filterSchema: FilterSchema<"VehicleExpenses"> = [
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
    column: "amount",
    label: "Amount",
    type: "range",
    range: { min: 0, max: 1000, step: 1 },
    default: [0, 0],
  },
  {
    column: "cost",
    label: "Cost",
    type: "number",
  },
  { column: "date", label: "Date", type: "date-range" },
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
        open = true;
      }
    "
  >
    <Icon name="mdi:filter-variant" />
    <span class="sm:block hidden">Filter</span>
  </button>

  <Drawer ref="drawerRef" title="Filter" direction="bottom" v-model:open="open">
    <template #body>
      <NuxtLoadingIndicator />

      <FilterForm :schema="schema" :filterState="filterState" />
    </template>

    <template #footer>
      <button class="btn btn-primary" @click="applyFilters">Apply</button>
      <button class="btn btn-soft" @click="resetFilters">Reset</button>
    </template>
  </Drawer>
</template>
