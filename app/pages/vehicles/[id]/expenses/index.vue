<script setup lang="ts">
// import {
//   downloadBlob,
//   exportToCSV,
//   exportToTxt,
//   generateExpenseReport,
//   parseRowsToTable,
// } from '@/utils/export';
// import { formatDate, toLocalPeriod } from '@/utils/date';
// import { type FilterOption } from '@/components/general/filter/FilterMenu.vue';

import ExpenseDialog from "~/components/vehicle/expense/dialog/ExpenseDialog.vue";
import ExpensesFilterDrawer from "~/features/vehicles/expenses/ExpensesFilterDrawer.vue";
import ExpensesListItem from "~/features/vehicles/expenses/ExpensesListItem.vue";
import { useVehicleExpenses } from "~/features/vehicles/expenses/useVehicleExpenses";
import type { Tables } from "~/types/supabase";

useHead({
  title: "Expenses",
});
definePageMeta({
  layout: "vehicle",
});

const overlay = useOverlay();
const vehicleExpenseDialog = overlay.create(ExpenseDialog);
const vehicleId = useRouteParam("id", "number");

const filters = ref<Array<FilterOption<Tables<"VehicleExpenses">>>>([]);

const {
  data: expenses,
  pending: loading,
  execute,
} = useVehicleExpenses(vehicleId, filters);

const exportOptions = [
  {
    extension: "txt",
    name: "Text File",
  },
  {
    extension: "csv",
    name: "CSV File",
  },
  { extension: "pdf", name: "PDF File" },
];

const sortControl = reactive<{
  key: keyof Tables<"VehicleExpenses">;
  direction: "asc" | "desc";
  options: Array<{
    label?: string;
    value: keyof Tables<"VehicleExpenses">;
  }>;
}>({
  key: "date",
  direction: "desc",
  options: [
    { value: "date", label: "Date" },
    { value: "cost", label: "Cost" },
    { value: "amount", label: "Amount" },
  ],
});

const groupedExpenses = computed(() => {
  // TODO: move sort to api call?
  const sorted = dynamicSort(
    expenses.value,
    sortControl.key,
    sortControl.direction,
  );

  if (!sorted || !Array.isArray(sorted)) return {};

  const enriched = sorted.map((expense) => ({
    ...expense,
    monthYear: formatDate(
      expense.date,
      sortControl.key === "date"
        ? { year: "numeric", month: "long" }
        : { year: "numeric" },
    ),
  }));

  const grouped = groupBy(enriched, "monthYear");

  return grouped;
});

const setSortKey = (key: keyof Tables<"VehicleExpenses">) => {
  sortControl.key = key;
};

const handleCreateExpense = () => {
  if (!vehicleId.value) return;

  vehicleExpenseDialog.open({ vehicleId: vehicleId.value });
};

const handleFilterApply = async (
  buildFilters: Ref<Array<FilterOption<Tables<"VehicleExpenses">>>>,
) => {
  filters.value = buildFilters.value;
  execute();
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-2 mb-3">
      <UButton label="Add" icon="mdi:plus" @click="handleCreateExpense" />

      <div class="flex items-center gap-2">
        <ExpensesFilterDrawer @applyFilters="handleFilterApply" />

        <ResponsiveMenu
          :items="
            sortControl.options.map((p) => ({
              label: p.label || p.value,
              value: p.value,
              active: sortControl.key === p.value,
              onClick: () => setSortKey(p.value),
            }))
          "
          alignMenu="end"
        >
          <UButton
            label="Sort"
            icon="mdi:sort"
            variant="outline"
            color="secondary"
          >
            <template #trailing>
              <UBadge
                :label="
                  sortControl.options.find((o) => o.value === sortControl.key)
                    ?.label
                "
                color="neutral"
                variant="soft"
                size="sm"
              />
            </template>
          </UButton>
        </ResponsiveMenu>

        <!-- <ExportButton @export="handleExpensesExport" :types="exportOptions" /> -->
      </div>
    </div>

    <!-- <UPageList divide>
      <UPageCard
        v-for="(expense, index) in expenses"
        :key="index"
        variant="ghost"
        :title="expense.type || ''"
      >
        <template #body>
          <UUser
            :avatar="{
              icon: expense.type === 'Fuel' ? 'mdi:gas-station' : 'mdi:cash',
            }"
            :name="expense.type || 'Unknown Expense'"
            :description="
              formatDate(expense.date, {
                dateStyle: 'medium',
              })
            "
            size="xl"
          />
        </template>
      </UPageCard>
    </UPageList> -->

    <ListGroup class="flex-1 overflow-hidden mb-16" ignoreListClass>
      <template v-if="loading">
        LOADING
        <!-- <ExpenseListItemSkeleton v-for="i in 10" :key="i" /> -->
      </template>

      <ListSubGroup
        v-for="(expenses, month) in groupedExpenses"
        :key="month"
        :title="month.toString()"
      >
        <ExpensesListItem
          v-for="(expense, index) in expenses"
          :key="index"
          :expense="expense"
        />
      </ListSubGroup>

      <ListGroupItem
        v-if="!expenses?.length || !Object.keys(groupedExpenses).length"
        title="No expenses found"
      />
    </ListGroup>
  </div>
</template>
