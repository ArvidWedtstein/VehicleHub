UPageCard
<script setup lang="ts">
import BarChart from "~/components/charts/BarChart.vue";

const vehicleId = useRouteParam("id", { type: "number", required: true });
const { data: services, pending: loading } = useVehicleServices(
  vehicleId,
  undefined,
  -1,
);

type Option = {
  value: string;
  label: string;
};
type ChartSettings = {
  typesOptions: Option[];
  periodOptions: Option[];
  selectedType: string;
  selectedCurrency: string;
  selectedPeriod: "month" | "year";
  currencyFormatOptions: Intl.NumberFormatOptions;
};

const chartSettings = reactive<ChartSettings>({
  typesOptions: [
    { value: "cost", label: "Cost" },
    { value: "repairs", label: "Repairs" },
  ],
  periodOptions: [
    { value: "month", label: "This year" },
    { value: "year", label: "Years" },
  ],
  selectedPeriod: "month",
  selectedCurrency: "NOK",
  selectedType: "cost",
  /** TODO: find solution for when user has registered services in different currencies */
  currencyFormatOptions: {
    style: "currency",
    currency: "NOK",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    notation: "compact",
  },
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

    const totalCost = items.reduce(
      (costAcc, currentItem) => costAcc + (currentItem?.cost || 0), // TODO: fix
      0,
    );

    return {
      cost: totalCost,
      repairs: items.length,
    };
  }, []);

  return axisValuesWithServicesData;
});
</script>

<template>
  <div>
    <StatCardSkeletonLoader v-if="loading" />

    <UPageCard
      v-else
      title="Services stats"
      icon="mdi:chart-bar"
      variant="soft"
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
            size="sm"
            color="neutral"
            :ui="{
              list: 'ring ring-accented rounded-full',
              indicator: 'rounded-full',
            }"
          />
        </div>
      </template>

      <BarChart
        class="max-h-64 max-w-fit"
        :xAxis="[
          {
            data: xAxisValues.map((p) => p.label),
            scaleType: 'band',
          },
        ]"
        :yAxis="[
          {
            valueFormatter: (value) => {
              const formattedNumber = formatNumber(
                parseInt((value || 0).toString()),
                chartSettings.selectedType === 'cost'
                  ? chartSettings.currencyFormatOptions
                  : undefined,
              );
              return value === null ? '' : formattedNumber;
            },
          },
        ]"
        :dataset="serviceData"
        :series="[
          {
            dataKey: chartSettings.selectedType === 'cost' ? 'cost' : 'repairs',
            color: '--color-secondary',
          },
        ]"
        :margin="{ top: 10, right: 10, bottom: 20 }"
      />
    </UPageCard>
  </div>
</template>
