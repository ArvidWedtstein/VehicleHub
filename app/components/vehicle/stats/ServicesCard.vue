<script setup lang="ts">
const vehicleId = useRouteParam("id", { type: "number", required: true });

type Option = {
  value: string;
  label: string;
};

const typesOptions = [
  { value: "cost", label: "Cost" },
  { value: "repairs", label: "Repairs" },
] as const satisfies Option[];

const periodOptions = [
  { value: "month", label: "This year" },
  { value: "year", label: "Last 10 years" },
] as const satisfies Option[];

type ChartSettings<U extends Option[], T extends Option[]> = {
  typesOptions: U;
  periodOptions: T;
  selectedType: U[number]["value"];
  selectedPeriod: T[number]["value"];
};
const chartSettings = reactive<
  ChartSettings<typeof typesOptions, typeof periodOptions>
>({
  typesOptions,
  periodOptions,
  selectedPeriod: "month",
  selectedType: "cost",
});

// Filter stuff
const soYearDate = adjustCalendarDate("start", "year");
const eoYearDate = adjustCalendarDate("end", "year");
const tenYearsAgoDate = new Date(new Date().getFullYear() - 10, 0, 1);

const rangeStart = computed(() =>
  chartSettings.selectedPeriod === "month" ? soYearDate : tenYearsAgoDate,
);

const filters = computed<
  FilterOption<Tables<"vehicleservicelogs_with_items">>[]
>(() => [
  { column: "date", operator: "gte", value: rangeStart.value.toISOString() },
  { column: "date", operator: "lte", value: eoYearDate.toISOString() },
]);

const { data: services, pending: loading } = useVehicleServices(
  vehicleId,
  filters,
  -1,
);
const user = useSupabaseUser();
const { data: profile } = useProfile(user.value?.sub);

const userCurrency = computed(() => profile.value?.currency ?? "NOK");

const formatCurrency = (num: number) =>
  formatNumber(num, {
    style: "currency",
    currency: userCurrency.value,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    notation: "compact",
  });

const periodDates = computed(() => {
  const unit = chartSettings.selectedPeriod === "month" ? "months" : "years";
  return getRangeBetweenDates(rangeStart.value, eoYearDate, unit, "date");
});

const serviceData = computed(() => {
  const isMonth = chartSettings.selectedPeriod === "month";
  const keyFormat = isMonth ? "yyyy-MM" : "yyyy";
  const labelFormat = isMonth ? "MMM" : "yyyy";

  const grouped = groupBy(
    (services.value ?? []).filter((s) => !!s.date),
    (s) => formatDateToFormat(new Date(s.date!), keyFormat),
  );

  return periodDates.value.map((date) => {
    const key = formatDateToFormat(date, keyFormat);
    const items = grouped[key] ?? [];

    return {
      key,
      label: formatDateToFormat(date, labelFormat),
      cost: sum(items, "total_cost_reporting"),
      repairs: items.length,
    };
  });
});
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <StatCardSkeletonLoader v-if="loading && !services?.length" />

    <UPageCard
      v-else
      title="Services"
      :description="`Cost ${userCurrency} or number of repairs`"
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
        :data="serviceData"
        index="label"
        :categories="[
          {
            key: chartSettings.selectedType,
            label: chartSettings.selectedType === 'cost' ? 'Cost' : 'Repairs',
          },
        ]"
        :format="
          (value) =>
            chartSettings.selectedType === 'cost'
              ? formatCurrency(value)
              : value.toString()
        "
      />
    </UPageCard>
  </div>
</template>
