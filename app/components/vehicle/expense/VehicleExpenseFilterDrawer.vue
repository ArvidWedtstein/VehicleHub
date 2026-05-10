<script setup lang="ts">
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";
import type { Tables } from "~/types/supabase";

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
    default: [null, null],
  },
  {
    column: "cost",
    label: "Cost",
    type: "number",
  },
  { column: "date", label: "Date", type: "date-range" },
] as const;

const { schema, filterState, buildFilters, resetFilters } =
  useFilterBuilder(filterSchema);

const applyFilters = async () => {
  console.log("filters", buildFilters.value);
  emit("applyFilters", buildFilters);

  open.value = false;
};
</script>

<template>
  <UDrawer
    v-model:open="open"
    direction="bottom"
    title="Filter"
    inset
    :handleOnly="true"
  >
    <UButton
      label="Filter"
      icon="mdi:filter"
      variant="outline"
      color="secondary"
    />

    <template #body>
      <FilterForm :schema="schema" :filterState="filterState" />
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
