<script setup lang="ts">
import { useVehicleExpenses } from "../expenses/useVehicleExpenses";

const vehicleId = useRouteParam("id", "number");
const { data: expenses, pending: loading } =
  await useVehicleExpenses(vehicleId);

const selectedPeriod = ref("month");

const statFuelCostPerMonth = computed(() => {
  const currentDate = new Date();
  const currentPeriod = formatDateToFormat(currentDate, "yyyy-MM");
  const prevPeriod = formatDateToFormat(
    addToDate(currentDate, -1, "month"),
    "yyyy-MM",
  );

  const currentYear = currentDate.getFullYear();
  const prevYear = addToDate(currentDate, -1, "year").getFullYear();

  const monthExpenses = expenses.value.map((expense) => {
    const expenseDate = new Date(expense.date);

    return {
      ...expense,
      monthYear: formatDateToFormat(expenseDate, "yyyy-MM"),
      year: expenseDate.getFullYear(),
    };
  });

  const currenciesUsed = monthExpenses.map((expense) => expense.currency);
  const uniqueCurrencies = [...new Set(currenciesUsed)];

  const groupedExpensesPerPeriod = groupBy(
    monthExpenses,
    selectedPeriod.value === "month" ? "monthYear" : "year",
  );

  const costPrevPeriod =
    sum(
      groupedExpensesPerPeriod[
        selectedPeriod.value === "month" ? prevPeriod : prevYear
      ] || { cost: 0 },
      "cost",
    ) || 0;

  const costThisPeriod =
    sum(
      groupedExpensesPerPeriod[
        selectedPeriod.value === "month" ? currentPeriod : currentYear
      ] || { cost: 0 },
      "cost",
    ) || 0;

  const percentageDiffToPrevPeriod =
    (costThisPeriod - costPrevPeriod) / costPrevPeriod;

  return {
    costPrevPeriod,
    costThisPeriod,
    percentageDiffToPrevPeriod: isNaN(percentageDiffToPrevPeriod)
      ? 0
      : percentageDiffToPrevPeriod,
    currencies: uniqueCurrencies,
  };
});

const statDiffToPrevPeriodText = computed(() => {
  const percentageDiff = statFuelCostPerMonth.value.percentageDiffToPrevPeriod;
  const diff = Math.abs(percentageDiff);
  const parsedDiff = formatNumber(diff, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const diffText = percentageDiff < 0 ? "less" : "more";

  const prevPeriodText = formatNumber(
    statFuelCostPerMonth.value.costPrevPeriod,
    {
      style: "currency",
      currencyDisplay: "narrowSymbol",
      currency: statFuelCostPerMonth.value.currencies[0] ?? "EUR",
      maximumFractionDigits: 0,
    },
  );

  const text = `${parsedDiff} ${diffText} than last ${selectedPeriod.value} (${prevPeriodText})`;

  return text;
});

const periodOptions = [
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];
</script>

<template>
  <UCard variant="soft" v-show="!loading">
    <template #header>
      <div class="flex items-center gap-2">
        <span>Spent on Fuel this:</span>
        <UTabs
          v-model="selectedPeriod"
          :items="periodOptions"
          :content="false"
          :unmountOnHide="false"
          size="sm"
          color="neutral"
        />
      </div>
    </template>

    <template #default>
      <div class="text-2xl font-bold">
        {{
          formatNumber(statFuelCostPerMonth.costThisPeriod, {
            style: "currency",
            currency: statFuelCostPerMonth.currencies[0] ?? "EUR",
            maximumFractionDigits: 0,
          })
        }}
      </div>
    </template>
    <template #footer>
      <div class="flex items-center gap-2">
        <Transition name="fade" mode="out-in">
          <Icon
            :name="
              statFuelCostPerMonth.percentageDiffToPrevPeriod >= 0
                ? 'mdi:trending-up'
                : 'mdi:trending-down'
            "
            :class="[
              statFuelCostPerMonth.percentageDiffToPrevPeriod >= 0
                ? 'text-success'
                : 'text-error',
            ]"
          />
        </Transition>
        {{ statDiffToPrevPeriodText }}
      </div>
    </template>
  </UCard>
</template>
