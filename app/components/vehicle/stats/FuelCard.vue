<script setup lang="ts">
const vehicleId = useRouteParam("id", { type: "number", required: true });

// TODO: replace with get_vehicle_expense func
const { data: expenses, pending: loading } = useVehicleExpenses(
  vehicleId,
  [],
  100000,
);

const user = useSupabaseUser();
const { data: profile } = useProfile(user.value?.sub);

const formatCurrency = (num: number) =>
  formatNumber(num, {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: profile.value?.currency ?? "EUR",
    maximumFractionDigits: 0,
  });

const statFuelCostPerMonth = computed(() => {
  const currentDate = new Date();
  const currentPeriod = formatDateToFormat(currentDate, "yyyy-MM");
  const prevPeriod = formatDateToFormat(
    addToDate(currentDate, -1, "month"),
    "yyyy-MM",
  );

  const monthExpenses = expenses.value.map((expense) => {
    const expenseDate = new Date(expense.date);

    return {
      ...expense,
      monthYear: formatDateToFormat(expenseDate, "yyyy-MM"),
    };
  });

  const groupedExpensesPerPeriod = groupBy(monthExpenses, "monthYear");

  const costPrevPeriod =
    sum(
      groupedExpensesPerPeriod[prevPeriod] || { cost_reporting: 0 },
      "cost_reporting",
    ) || 0;

  const costThisPeriod =
    sum(
      groupedExpensesPerPeriod[currentPeriod] || { cost_reporting: 0 },
      "cost_reporting",
    ) || 0;

  const percentageDiffToPrevPeriod =
    (costThisPeriod - costPrevPeriod) / costPrevPeriod;

  return {
    costPrevPeriod,
    costThisPeriod,
    percentageDiffToPrevPeriod: isNaN(percentageDiffToPrevPeriod)
      ? 0
      : percentageDiffToPrevPeriod,
  };
});

const statDiffToPrevPeriodText = computed(() => {
  const percentageDiff = statFuelCostPerMonth.value.percentageDiffToPrevPeriod;
  const diff = Math.abs(percentageDiff);
  const parsedDiff = formatNumber(diff, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const prevPeriodText = formatCurrency(
    statFuelCostPerMonth.value.costPrevPeriod,
  );

  const text = `${parsedDiff} vs last month} (${prevPeriodText})`;
  if (!diff && !statFuelCostPerMonth.value.costPrevPeriod) return;

  return text;
});
</script>

<template>
  <UCard
    title="Fuel this month"
    variant="soft"
    v-show="!loading"
    :ui="{ root: 'divide-none', body: 'pt-0!' }"
  >
    <div class="text-2xl font-bold">
      <Transition name="fade" mode="out-in">
        <template v-if="statFuelCostPerMonth.costThisPeriod">{{
          formatCurrency(statFuelCostPerMonth.costThisPeriod)
        }}</template>
        <UIcon v-else name="mdi:minus" />
      </Transition>
    </div>
    <div class="flex items-center gap-2">
      <Transition name="fade" mode="out-in">
        <span
          v-if="!statFuelCostPerMonth.percentageDiffToPrevPeriod"
          class="text-muted"
        >
          No fill-ups logged this month
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
    </div>
  </UCard>
</template>
