<script setup lang="ts">
const vehicleId = useRouteParam("id", { type: "number", required: true });

const user = useSupabaseUser();
const { data: profile } = useProfile(user.value?.sub);

const {
  data: expenseInsights,
  pending: loadingExpenses,
  execute: retrieveExpensesInsights,
} = useSupabaseRpc("get_vehicle_expense_insights");

const {
  data: serviceInsights,
  pending: loadingServices,
  execute: retrieveServicesInsights,
} = useSupabaseRpc("get_vehicle_service_insights");

const formatCurrency = (num: number) =>
  formatNumber(num, {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: profile.value?.currency ?? "EUR",
    maximumFractionDigits: 0,
  });

const spendingStats = computed(() => {
  const totalSpent =
    (expenseInsights.value?.spend?.total_cost ?? 0) +
    (serviceInsights.value?.summary?.total_cost ?? 0);
  return {
    totalSpent,
  };
});

onBeforeMount(async () => {
  const soYearDate = adjustCalendarDate("start", "year");
  const eoYearDate = adjustCalendarDate("end", "year");

  retrieveExpensesInsights({
    p_vehicle_id: vehicleId.value,
    p_from: soYearDate.toISOString(),
    p_to: eoYearDate.toISOString(),
  });
  retrieveServicesInsights({
    p_vehicle_id: vehicleId.value,
    p_from: soYearDate.toISOString(),
    p_to: eoYearDate.toISOString(),
  });

  console.log("data", expenseInsights, serviceInsights);
});
</script>

<template>
  <UCard
    title="Spent this year"
    variant="soft"
    v-show="!loadingExpenses && !loadingServices"
    :ui="{ root: 'divide-none', body: 'pt-0!' }"
  >
    <div class="text-2xl font-bold">
      <Transition name="fade" mode="out-in">
        <template v-if="spendingStats.totalSpent">{{
          formatCurrency(spendingStats.totalSpent)
        }}</template>
        <UIcon v-else name="mdi:minus" />
      </Transition>
    </div>
    <!-- <div class="flex items-center gap-2">
      <Transition name="fade" mode="out-in">
        <span v-if="!expenseInsights && !serviceInsights" class="text-muted">
          No spendings this year
        </span>
        <div
          v-else
          :class="[
            statFuelCostPerMonth.percentageDiffToPrevPeriod >= 0
              ? 'text-success'
              : 'text-error',
          ]"
        >
          <Icon
            :name="
              statFuelCostPerMonth.percentageDiffToPrevPeriod >= 0
                ? 'mdi:trending-up'
                : 'mdi:trending-down'
            "
          />
          {{ statDiffToPrevPeriodText }}
        </div>
      </Transition>
    </div> -->
  </UCard>
</template>
