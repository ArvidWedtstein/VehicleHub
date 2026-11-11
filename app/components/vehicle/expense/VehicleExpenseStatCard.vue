<script setup lang="ts">
const vehicleId = useRouteParam("id", { type: "number", required: true });
const { data: expenses, pending: loading } = useVehicleExpenses(
  vehicleId,
  undefined,
  -1,
);

type Option = {
  value: string;
  label: string;
};

type ChartSettings<U extends readonly Option[], T extends readonly Option[]> = {
  typesOptions: U;
  periodOptions: T;
  selectedType: U[number]["value"];
  selectedCurrency: string;
  selectedPeriod: T[number]["value"];
  selectedUnit: string;
};

const chartSettings = reactive<ChartSettings<Option[], Option[]>>({
  typesOptions: [
    { value: "totalCost", label: "Fuel Cost" },
    { value: "averageFuelPrice", label: "Avg Fuel Price" },
    { value: "totalAmount", label: "Total Amount" },
  ] as const,
  periodOptions: [
    { value: "month", label: "This year" },
    { value: "year", label: "Last 10 years" },
  ] as const,
  selectedPeriod: "month",
  selectedCurrency: "NOK",
  selectedType: "totalCost",
  selectedUnit: "liter",
} as const);

const amountFormatOptions = computed<Intl.NumberFormatOptions>(() => {
  return {
    style: "unit",
    unitDisplay: "short",
    unit: chartSettings.selectedUnit,
  };
});
const currencyFormatOptions = computed<Intl.NumberFormatOptions>(() => {
  return {
    style: "currency",
    currency: chartSettings.selectedCurrency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    notation: "compact",
  };
});

const xAxisValues = computed(() => {
  const soYearDate = adjustCalendarDate("start", "year");
  const eoYearDate = adjustCalendarDate("end", "year");

  const startDate =
    chartSettings.selectedPeriod === "month"
      ? soYearDate
      : new Date(new Date().getFullYear() - 10, 1, 1);

  const period = chartSettings.selectedPeriod === "month" ? "months" : "years";
  const range = getRangeBetweenDates(startDate, eoYearDate, period, "date");

  return range.map((p) => {
    if (chartSettings.selectedPeriod === "month") {
      return {
        label: formatDateToFormat(p, "MMM"),
        date: p,
      };
    }

    return {
      label: formatDateToFormat(p, "yyyy"),
      date: p,
    };
  });
});

const expensesData = computed(() => {
  const selectedPeriod = chartSettings.selectedPeriod;
  const servicesGroupedBySelectedPeriod = groupBy(expenses.value, (s) => {
    if (selectedPeriod === "month") {
      return formatDateToFormat(new Date(s.date), "MMM yyyy");
    }

    return formatDateToFormat(new Date(s.date), "yyyy");
  });

  const axisValuesWithServicesData = xAxisValues.value.map(({ date }) => {
    const groupKey =
      selectedPeriod === "month"
        ? formatDateToFormat(date, "MMM yyyy")
        : formatDateToFormat(date, "yyyy");

    const items = servicesGroupedBySelectedPeriod[groupKey] || [];

    const totalCost = items.reduce(
      (costAcc, currentItem) => costAcc + (currentItem.cost || 0),
      0,
    );
    const totalAmount = items.reduce(
      (amountAcc, currentItem) => amountAcc + (currentItem.amount || 0),
      0,
    );

    const numbers = items.map((item) => item.price_per_unit || 0);
    const averageFuelPrice = sum(numbers) / numbers.length;

    return {
      key: groupKey,
      value:
        chartSettings.selectedType === "totalCost"
          ? totalCost
          : chartSettings.selectedType === "totalAmount"
            ? totalAmount
            : averageFuelPrice,
    };
  }, []);

  return axisValuesWithServicesData;
});

const uniqueCurrencies = computed(() => {
  const currenciesUsed = expenses.value.map((expense) => expense.currency);
  return [...new Set(currenciesUsed)];
});
const uniqueUnits = computed(() => {
  const unitsUsed = expenses.value.map((expense) => expense.unit);
  return [...new Set(unitsUsed)];
});
</script>

<template>
  <div class="w-full overflow-auto">
    <template v-if="loading">
      <StatCardSkeletonLoader />
    </template>

    <UPageCard
      v-else
      title="Expenses Overview"
      icon="mdi:chart-bar"
      variant="soft"
      class="w-full"
    >
      <template #description>
        <div class="flex justify-baseline items-center gap-2">
          <UTabs
            v-model="chartSettings.selectedType"
            :items="chartSettings.typesOptions"
            :content="false"
            :unmountOnHide="false"
            color="neutral"
            size="sm"
            :ui="{
              list: 'ring ring-accented rounded-full',
              indicator: 'rounded-full',
            }"
          />

          <UTabs
            v-model="chartSettings.selectedPeriod"
            :items="chartSettings.periodOptions"
            :content="false"
            :unmountOnHide="false"
            color="neutral"
            size="sm"
            :ui="{
              list: 'ring ring-accented rounded-full',
              indicator: 'rounded-full',
            }"
          />
        </div>
      </template>

      <UChart
        type="bar"
        :data="expensesData"
        index="key"
        xLabel="Period"
        :yLabel="
          chartSettings.selectedType === 'totalCost'
            ? 'Fuel Cost'
            : chartSettings.selectedType === 'totalAmount'
              ? 'Total Amount in ' + chartSettings.selectedUnit
              : 'Average Fuel Price'
        "
        :categories="[
          {
            key: 'value',
            label:
              chartSettings.typesOptions.find(
                (option) => option.value === chartSettings.selectedType,
              )?.label || '',
          },
        ]"
        :format="
          (value) => {
            const formattedNumber = formatNumber(
              parseInt((value || 0).toString()),
              chartSettings.selectedType === 'totalAmount'
                ? amountFormatOptions
                : currencyFormatOptions,
            );

            return formattedNumber;
          }
        "
      />
    </UPageCard>
  </div>
</template>
