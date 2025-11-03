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

import ExpensesFilterDrawer from "~/features/vehicles/expenses/ExpensesFilterDrawer.vue";
import ExpensesListItem from "~/features/vehicles/expenses/ExpensesListItem.vue";
import { useVehicleExpenses } from "~/features/vehicles/expenses/useVehicleExpenses";
import type { Tables } from "~/types/supabase";

useHead({
  title: "Expenses",
});
definePageMeta({
  middleware: "auth",
  layout: "vehicle",
});

const ExpenseDialog = defineAsyncComponent(
  async () =>
    await import("~/features/vehicles/expenses/expenseDialog/ExpenseDialog.vue")
);

const vehicleId = useRouteParam("id", "number");

const filters = ref<Array<FilterOption<Tables<"VehicleExpenses">>>>([]);

const {
  data: expenses,
  pending: loading,
  execute,
} = await useVehicleExpenses(vehicleId, filters);
const expenseDialog = ref<InstanceType<typeof ExpenseDialog>>();

// const handleExpensesExport = async (type: string) => {
//   const columnsToExport: Array<keyof Tables<'VehicleExpenses'>> = [
//     'type',
//     'vehicle_id',
//     'date',
//     'cost',
//     'currency',
//     'amount',
//     'unit',
//     'price_per_unit',
//     'mileage',
//     'notes',
//   ];

//   const table = parseRowsToTable(expenses.value, columnsToExport);

//   let blob: Blob | null = null;

//   switch (type) {
//     case 'txt':
//       blob = exportToTxt(table);
//       break;
//     case 'csv':
//       blob = exportToCSV(expenses.value, columnsToExport);
//       break;
//     case 'pdf':
//       const expensesWithPeriod = expenses.value.map(expense => ({
//         ...expense,
//         period: toLocalPeriod(new Date(expense.date)),
//         formattedDate: formatDate(expense.date),
//         groupHeader: new Date(expense.date).toLocaleString('en-GB', {
//           month: 'long',
//           year: 'numeric',
//         }),
//       }));

//       blob = await generateExpenseReport(
//         expensesWithPeriod,
//         'period',
//         'groupHeader',
//         [
//           { field: 'formattedDate', width: 150 },
//           { field: 'type' },
//           { field: 'notes' },
//           { field: 'cost' },
//         ],
//       );
//       break;
//   }

//   if (!blob) return;

//   downloadBlob(blob, `expenses.${type}`);
// };

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
    sortControl.direction
  );

  const enriched = sorted.map((expense) => ({
    ...expense,
    monthYear: formatDate(
      expense.date,
      sortControl.key === "date"
        ? { year: "numeric", month: "long" }
        : { year: "numeric" }
    ),
  }));

  const grouped = groupBy(enriched, "monthYear");

  return grouped;
});

const setSortKey = (key: keyof Tables<"VehicleExpenses">) => {
  sortControl.key = key;
};

const handleCreateExpense = () => {
  console.log("handleCreateExpense");
  if (!vehicleId.value) return;
  expenseDialog.value?.open(vehicleId.value);
};

const handleFilterApply = async (
  buildFilters: Ref<Array<FilterOption<Tables<"VehicleExpenses">>>>
) => {
  filters.value = buildFilters.value;
  execute();
};
</script>

<template>
  <div>
    <ExpenseDialog ref="expenseDialog" />

    <div class="flex items-center justify-between gap-2 mb-3">
      <button
        type="button"
        class="btn btn-primary w-auto"
        @click="handleCreateExpense"
      >
        <Icon name="mdi:plus" />
        Add Expense
      </button>

      <div class="flex items-center gap-2">
        <div class="join">
          <ExpensesFilterDrawer @applyFilters="handleFilterApply" />
          <!-- <ExpensesFilter
          @reset="handleFiltersReset"
          @apply="handleFilterApply"
          class="join-item"
        /> -->

          <Menu
            btnClass="btn btn-outline join-item"
            :items="
              sortControl.options.map((p) => ({
                label: p.label || p.value,
                checked: sortControl.key === p.value,
                onClick: () => setSortKey(p.value),
              }))
            "
            :alignMenu="'end'"
          >
            <Icon name="mdi:sort" class="sm:block hidden" />
            Sorted on:
            <span class="badge badge-neutral">
              {{
                sortControl.options.find((o) => o.value === sortControl.key)
                  ?.label
              }}
            </span>
          </Menu>
        </div>

        <!-- <ExportButton @export="handleExpensesExport" :types="exportOptions" /> -->
      </div>
    </div>

    <ListGroup class="flex-1 overflow-hidden" ignoreListClass>
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
