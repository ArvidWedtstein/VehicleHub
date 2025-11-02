<script setup lang="ts">
import BarChart from "~/components/charts/BarChart.vue";
import { useVehicleServices } from "../services/useVehicleServices";
import StatCardSkeletonLoader from "./StatCardSkeletonLoader.vue";

const vehicleId = useRouteParam("id", "number");
const { data: services, pending: loading } = await useVehicleServices(
  vehicleId
);

type Option = {
  value: string;
  label: string;
};
type ChartSettings = {
  options: Option[];
  periodOptions: Option[];
  selectedMode: string;
  selectedCurrency: string;
  selectedPeriod: "month" | "year";
  currencyFormatOptions: Intl.NumberFormatOptions;
};

const chartSettings = reactive<ChartSettings>({
  options: [
    { value: "cost", label: "Cost" },
    { value: "repairs", label: "Repairs" },
  ],
  periodOptions: [
    { value: "month", label: "This year" },
    { value: "year", label: "Years" },
  ],
  selectedPeriod: "month",
  selectedCurrency: "NOK",
  selectedMode: "cost",
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
      0
    );

    return {
      cost: totalCost,
      repairs: items.length,
    };
  }, []);

  return axisValuesWithServicesData;
});

const uniqueCurrencies = computed(() => {
  const currenciesUsed = services.value.map((service) => service.currency);
  return [...new Set(currenciesUsed)];
});
</script>

<template>
  <div>
    <template v-if="loading">
      <StatCardSkeletonLoader />
    </template>

    <div v-else class="card card-sm bg-base-200 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">Services</h2>
        <div class="card-actions">
          <FormInput
            type="select"
            size="sm"
            label="Period"
            wrapperClass="w-40"
            :validate="false"
            :options="chartSettings.periodOptions"
            v-model="chartSettings.selectedPeriod"
          />
          <FormInput
            type="select"
            size="sm"
            label="Type"
            wrapperClass="w-40"
            :validate="false"
            v-model="chartSettings.selectedMode"
            :options="chartSettings.options"
          />

          <FormInput
            type="select"
            size="sm"
            label="Currency"
            wrapperClass="w-xs"
            :validate="false"
            v-model="chartSettings.selectedCurrency"
            :options="
              uniqueCurrencies.map((currency) => ({ value: currency || 'EUR' }))
            "
          />
        </div>

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
                  chartSettings.selectedMode === 'cost'
                    ? chartSettings.currencyFormatOptions
                    : undefined
                );
                return value === null ? '' : formattedNumber;
              },
            },
          ]"
          :dataset="serviceData"
          :series="[
            {
              dataKey:
                chartSettings.selectedMode === 'cost' ? 'cost' : 'repairs',
              color: '--color-secondary',
            },
          ]"
          :margin="{ top: 10, right: 10, bottom: 20 }"
        />
      </div>
    </div>
  </div>
</template>
