<script setup lang="ts">
const vehicleId = useRouteParam("id", { type: "number", required: true });

type Option = {
  value: string;
  label: string;
};

const typesOptions = [
  { value: "totalCost", label: "Fuel Cost" },
  { value: "averageFuelPrice", label: "Price per Litre" },
  { value: "totalAmount", label: `Litres filled` },
] as const satisfies Option[];

const periodOptions = [
  { value: "month", label: "This year" },
  { value: "year", label: "Last 10 years" },
] as const satisfies Option[];

type ChartSettings<U extends readonly Option[], T extends readonly Option[]> = {
  typesOptions: U;
  periodOptions: T;
  selectedType: U[number]["value"];
  selectedPeriod: T[number]["value"];
  selectedUnit: string;
};
const chartSettings = reactive<
  ChartSettings<typeof typesOptions, typeof periodOptions>
>({
  typesOptions,
  periodOptions,
  selectedPeriod: "month",
  selectedType: "totalCost",
  selectedUnit: "liter",
});

const soYearDate = adjustCalendarDate("start", "year");
const eoYearDate = adjustCalendarDate("end", "year");
const tenYearsAgoDate = new Date(new Date().getFullYear() - 10, 0, 1);

const rangeStart = computed(() =>
  chartSettings.selectedPeriod === "month" ? soYearDate : tenYearsAgoDate,
);

const filters = computed<FilterOption<Tables<"vehicle_expenses_converted">>[]>(
  () => [
    { column: "date", operator: "gte", value: rangeStart.value.toISOString() },
    { column: "date", operator: "lte", value: eoYearDate.toISOString() },
  ],
);

const { data: expenses, pending: loading } = useVehicleExpenses(
  vehicleId,
  filters,
  -1,
);
const user = useSupabaseUser();
const { data: profile } = useProfile(user.value?.sub);

const userCurrency = computed(() => profile.value?.currency ?? "NOK");

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
    currency: userCurrency.value,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: "compact",
  };
});

const periodDates = computed(() => {
  const unit = chartSettings.selectedPeriod === "month" ? "months" : "years";
  return getRangeBetweenDates(rangeStart.value, eoYearDate, unit, "date");
});

const expensesData = computed(() => {
  const isMonth = chartSettings.selectedPeriod === "month";
  const keyFormat = isMonth ? "yyyy-MM" : "yyyy";
  const labelFormat = isMonth ? "MMM" : "yyyy";

  const grouped = groupBy(
    expenses.value.filter((s) => !!s.date),
    (s) => formatDateToFormat(new Date(s.date!), keyFormat),
  );

  return periodDates.value.map((date) => {
    const key = formatDateToFormat(date, keyFormat);
    const items = grouped[key] ?? [];

    return {
      key,
      label: formatDateToFormat(date, labelFormat),
      totalCost: sum(items, "cost_reporting"),
      totalAmount: sum(items, "amount"),
      averageFuelPrice: sum(items, "price_per_unit_reporting") / items.length,
    };
  });
});
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <StatCardSkeletonLoader v-if="loading && !expenses?.length" />

    <UPageCard
      v-else
      title="Fuel"
      :description="`Monthly cost (${userCurrency}), price per litre and litres filled`"
      variant="soft"
      class="w-full min-h-full"
    >
      <div class="flex justify-baseline items-center gap-2">
        <UTabs
          v-model="chartSettings.selectedType"
          :items="chartSettings.typesOptions"
          :content="false"
          :unmountOnHide="false"
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
          size="sm"
          :ui="{
            list: 'ring ring-accented rounded-full',
            indicator: 'rounded-full',
          }"
        />
      </div>

      <UChart
        :type="
          chartSettings.selectedType === 'averageFuelPrice' ? 'line' : 'bar'
        "
        :data="expensesData"
        index="label"
        points
        :categories="[
          {
            key: chartSettings.selectedType,
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
