<script setup lang="ts">
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";
import type { Tables } from "~/types/supabase";

const vehicleId = useRouteParam("id", { type: "number", required: true });

const filterSchema: FilterSchema<"VehicleExpenses"> = [
  {
    column: "currency",
    label: "Valuta",
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
  { column: "date", label: "Dateo", type: "date-range" },
];

const { schema, filterState, buildFilters, resetFilters } =
  useFilterBuilder(filterSchema);

const {
  data: expenses,
  pending: loading,
  refresh,
} = useVehicleExpenses(vehicleId, buildFilters);

console.log("expenses", expenses.value);

const applyFilters = async () => {
  console.log("filters", buildFilters.value);
  await refresh();

  console.log("expenses", expenses.value);
};
</script>

<template>
  <div>
    <NuxtLoadingIndicator />

    <FilterForm :schema="schema" :filterState="filterState" />

    <button class="btn btn-primary" @click="applyFilters">Apply</button>
    <button class="btn btn-soft" @click="resetFilters">reset</button>
  </div>
</template>
