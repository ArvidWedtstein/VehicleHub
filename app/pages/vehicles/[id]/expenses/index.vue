<script setup lang="ts">
import VehicleExpenseDialog from "~/components/vehicle/expense/dialog/VehicleExpenseDialog.vue";
import type { Tables } from "~/types/supabase";

useHead({
  title: "Expenses",
});

const overlay = useOverlay();
const toast = useToast();
const vehicleId = useRouteParam("id", { type: "number", required: true });

const vehicleExpenseDialog = overlay.create(VehicleExpenseDialog);
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
  toast.add({
    title: "Opening expense dialog",
    color: "info",
  });
  console.log("handleCreateExpense", vehicleId.value);
  if (!vehicleId.value)
    return console.log("No vehicleId found, cannot create expense");

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
  <UPage class="flex-1 p-2 overflow-hidden">
    <div class="flex items-center justify-between gap-2 mb-3">
      <UButton
        label="Add"
        icon="mdi:plus"
        @click="handleCreateExpense"
        data-testid="add-expense"
      />

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

    <LazyUEmpty
      v-if="!expenses.length"
      title="No Expenses Found"
      description="It looks like you haven't added any expenses. Create one to get started."
      :actions="[
        {
          icon: 'mdi:plus',
          label: 'Create new',
          onClick: handleCreateExpense,
        },
        {
          icon: 'mdi:refresh',
          label: 'Refresh',
          color: 'neutral',
          variant: 'subtle',
          loading: loading,
          loadingAuto: true,
          onClick: () => refresh(),
        },
      ]"
    />

    <UScrollArea
      ref="scrollArea"
      class="w-full min-h-0 h-[calc(100dvh-var(--ui-header-height)-9rem)]"
      :items="expenses"
      :virtualize="{
        estimateSize: 92,
        skipMeasurement: true,
      }"
      v-slot="{ item }"
    >
      <!-- <USeparator
        :label="expenses[0]?.monthYear || ''"
        orientation="horizontal"
        :key="index"
        size="lg"
      />
      <UPageList> -->
      <!-- v-for="(item, idx) in expenses"
        :key="idx" -->

      <div
        v-if="status === 'pending' || status === 'idle'"
        class="flex items-center gap-4 p-4 sm:p-6"
      >
        <USkeleton class="size-12 rounded-full" />

        <div class="grid gap-2">
          <USkeleton class="h-4 w62.5" />
          <USkeleton class="h-4 w-50" />
        </div>
      </div>

      <UPageCard
        v-else
        :key="item.id"
        variant="ghost"
        :title="item.type || ''"
        :to="{
          name: 'vehicles-id-expenses-expenseId',
          params: { id: item.vehicle_id, expenseId: item.id },
        }"
        :ui="{ body: 'flex items-center justify-between w-full' }"
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

          <UIcon name="mdi:chevron-right" class="size-8" />
        </template>
      </UPageCard>
      <!-- </UPageList> -->
    </UScrollArea>
  </UPage>
</template>
