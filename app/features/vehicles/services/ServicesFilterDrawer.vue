<script setup lang="ts">
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";

const open = ref(false);

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
  <UDrawer v-model:open="open" direction="bottom" title="Filter" inset>
    <UButton
      label="Filter"
      icon="mdi:filter-variant"
      variant="outline"
      color="secondary"
    />

    <template #body>
      <FilterForm class="m-0" :schema="schema" :filterState="filterState" />
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton label="Apply" size="lg" @click="applyFilters" />

        <UButton
          label="Reset"
          color="neutral"
          variant="soft"
          size="lg"
          @click="resetFilters"
        />
      </div>
    </template>
  </UDrawer>
</template>
