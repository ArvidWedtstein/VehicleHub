<script setup lang="ts">
const vehicleId = useRouteParam("id", { type: "number", required: true });
const {
  data: services,
  pending: loading,
  refresh,
} = useVehicleServices(vehicleId, undefined, -1);
const user = useSupabaseUser();
const { data: profile } = useProfile(user.value?.sub);

type Option = {
  value: string;
  label: string;
};
type ChartSettings = {
  typesOptions: Option[];
  periodOptions: Option[];
  selectedType: "cost" | "repairs";
  selectedPeriod: "month" | "year";
};

const userCurrency = computed(() => profile.value?.currency ?? "NOK");

const chartSettings = reactive<ChartSettings>({
  typesOptions: [
    { value: "cost", label: "Cost" },
    { value: "repairs", label: "Repairs" },
  ],
  periodOptions: [
    { value: "month", label: "This year" },
    { value: "year", label: "All time" },
  ],
  selectedPeriod: "month",
  selectedType: "cost",
});

const formatCurrency = (num: number) =>
  formatNumber(num, {
    style: "currency",
    currency: profile.value?.currency ?? "NOK",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    notation: "compact",
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

const serviceData = computed(() => {
  const selectedPeriod = chartSettings.selectedPeriod;
  const servicesGroupedBySelectedPeriod = groupBy(services.value, (s) => {
    if (selectedPeriod === "month") {
      return formatDateToFormat(new Date(s.date || ""), "MMM yyyy");
    }

    return formatDateToFormat(new Date(s.date || ""), "yyyy");
  });

  const axisValuesWithServicesData = xAxisValues.value.map(({ date }) => {
    const groupKey =
      selectedPeriod === "month"
        ? formatDateToFormat(date, "MMM yyyy")
        : formatDateToFormat(date, "yyyy");

    const items = servicesGroupedBySelectedPeriod[groupKey] || [];

    const totalCost = sum(items, "total_cost");

    return {
      key: groupKey,
      cost: totalCost,
      repairs: items.length,
    };
  }, []);

  return axisValuesWithServicesData;
});

onMounted(() => {
  if (!services.value.length && !loading) {
    refresh();
  }
});
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <StatCardSkeletonLoader v-if="loading" />

    <UPageCard
      v-else
      title="Services"
      :description="`Monthly cost ${userCurrency} or number of repairs`"
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
        index="key"
        :categories="[
          {
            key: chartSettings.selectedType,
            label: chartSettings.selectedType === 'cost' ? 'Cost' : 'Repairs',
          },
        ]"
        :format="
          (value) => {
            if (chartSettings.selectedType === 'cost') {
              return formatCurrency(value);
            }

            return value.toString();
          }
        "
      />
    </UPageCard>
  </div>
</template>
