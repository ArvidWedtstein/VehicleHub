<script setup lang="ts">
import { useVehicleExpenses } from "../expenses/useVehicleExpenses";

const vehicleId = useRouteParam("id", "number");
const { data: expenses, pending: loading } = await useVehicleExpenses(
  vehicleId
);

const selectedPeriod = ref("month");

const statFuelCostPerMonth = computed(() => {
  const currentDate = new Date();
  const currentPeriod = formatDateToFormat(currentDate, "yyyy-MM");
  const prevPeriod = formatDateToFormat(
    addToDate(currentDate, -1, "month"),
    "yyyy-MM"
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
    selectedPeriod.value === "month" ? "monthYear" : "year"
  );

  const costPrevPeriod =
    sum(
      groupedExpensesPerPeriod[
        selectedPeriod.value === "month" ? prevPeriod : prevYear
      ] || { cost: 0 },
      "cost"
    ) || 0;

  const costThisPeriod =
    sum(
      groupedExpensesPerPeriod[
        selectedPeriod.value === "month" ? currentPeriod : currentYear
      ] || { cost: 0 },
      "cost"
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
    }
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
  <div class="stats">
    <div class="stat bg-base-200 shadow-lg" v-show="!loading">
      <div class="stat-figure text-primary">
        <Icon name="mdi:gas-station" class="inline-block" size="2em" />
      </div>
      <div class="stat-title">
        <div class="flex items-center gap-2">
          <span>Spent on Fuel this:</span>
          <FormInput
            type="select"
            size="sm"
            :validate="false"
            wrapperClass="min-w-28 w-auto"
            :options="periodOptions"
            v-model="selectedPeriod"
          />
        </div>
      </div>
      <div class="stat-value text-primary">
        {{
          formatNumber(statFuelCostPerMonth.costThisPeriod, {
            style: "currency",
            currency: statFuelCostPerMonth.currencies[0] ?? "EUR",
            maximumFractionDigits: 0,
          })
        }}
      </div>
      <div class="stat-desc flex items-center gap-2">
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
    </div>
  </div>
</template>
