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
  status,
  offset,
  hasMore,
  loadMore,
  refresh,
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

// TODO: fix expense not showing up after creation
const groupedExpenses = computed(() => {
  const sorted = dynamicSort(
    expenses.value,
    sortControl.key,
    sortControl.direction,
  );

  if (!sorted || !Array.isArray(sorted)) return [];

  const enriched = sorted.map((expense) => ({
    ...expense,
    monthYear: formatDate(
      expense.date,
      sortControl.key === "date"
        ? { year: "numeric", month: "long" }
        : { year: "numeric" },
    ),
  }));

  const grouped = Object.values(groupBy(enriched, "monthYear"));
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
  refresh();
};

const scrollArea = useTemplateRef("scrollArea");

onMounted(() => {
  useInfiniteScroll(
    scrollArea.value?.$el,
    () => {
      if (!hasMore.value) return;
      loadMore();
      console.log("Load more", offset.value);
    },
    {
      direction: "bottom",
      distance: 200,
      canLoadMore: () => {
        return status.value !== "pending" && !loading.value && hasMore.value;
      },
    },
  );
});
</script>

<template>
  <UPage>
    <div class="flex items-center justify-between gap-2 mb-3">
      <UButton label="Add" icon="mdi:plus" @click="handleCreateExpense" />

      <div class="flex items-center gap-2">
        <VehicleExpenseFilterDrawer @applyFilters="handleFilterApply" />

        <ResponsiveMenu
          title="Sort By"
          :items="
            sortControl.options.map((p) => ({
              label: p.label || p.value,
              value: p.value,
              active: sortControl.key === p.value,
              onClick: () => setSortKey(p.value),
            }))
          "
        >
          <UButton icon="mdi:sort" variant="outline" color="secondary">
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

    <UScrollArea
      ref="scrollArea"
      class="w-full h-100"
      :items="groupedExpenses"
      :virtualize="{
        estimateSize: (index) => {
          const expenses = groupedExpenses[index] || [];
          return 92 * expenses.length + 48; // 92px per item + 48px for the separator
        },
        skipMeasurement: true,
      }"
      v-slot="{ item: expenses, index }"
    >
      <USeparator
        :label="expenses[0]?.monthYear || ''"
        orientation="horizontal"
        :key="index"
        size="lg"
      />
      <UPageList>
        <UPageCard
          v-for="(item, idx) in expenses"
          :key="idx"
          variant="ghost"
          :title="item.type || ''"
          :to="{
            name: 'vehicles-id-expenses-expenseId',
            params: { id: item.vehicle_id, expenseId: item.id },
          }"
        >
          <template #body>
            <UUser
              :avatar="{
                icon: item.type === 'Fuel' ? 'mdi:gas-station' : 'mdi:cash',
              }"
              :name="item.type || 'Unknown Expense'"
              :description="
                formatDate(item.date, {
                  dateStyle: 'medium',
                })
              "
              size="xl"
            />
          </template>
        </UPageCard>
      </UPageList>
    </UScrollArea>
  </UPage>
</template>
