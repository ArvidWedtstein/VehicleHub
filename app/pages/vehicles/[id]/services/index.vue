<script setup lang="ts">
import ServicesFilterDrawer from "~/features/vehicles/services/ServicesFilterDrawer.vue";
import ServicesListItem from "~/features/vehicles/services/ServicesListItem.vue";
import { useVehicleServices } from "~/features/vehicles/services/useVehicleServices";
import type { Tables } from "~/types/supabase";

useHead({
  title: "Services",
});
definePageMeta({
  middleware: "auth",
  layout: "vehicle",
});

const vehicleId = useRouteParam("id", "number");

const filters = ref<Array<FilterOption<Tables<"VehicleExpenses">>>>([]);

const {
  data: services,
  refresh,
  pending: loading,
} = await useVehicleServices(vehicleId, filters);

const ServiceDialog = defineAsyncComponent(
  async () =>
    await import("~/features/vehicles/services/serviceDialog/ServiceDialog.vue")
);

const serviceDialogRef = ref<InstanceType<typeof ServiceDialog>>();

const handleServicesExport = (type: string) => {
  const columnsToExport: Array<keyof Tables<"VehicleServiceLogs">> = [
    "type",
    "vehicle_id",
    "date",
    "provider",
    "cost",
    "currency",
    "mileage",
    "notes",
  ];
  const table = parseRowsToTable(services.value, columnsToExport);

  let blob: Blob | null = null;

  switch (type) {
    case "txt":
      blob = exportToTxt(table);
      break;
    case "csv":
      blob = exportToCSV(services.value, columnsToExport);
      break;
  }

  if (!blob) return;

  downloadBlob(blob, `services.${type}`);
};

// const filters = ref<Array<FilterOption>>([]);

const filterMappings: Record<string, keyof Tables<"VehicleServiceLogs">> = {
  Date: "date",
  Currency: "currency",
  "Created by me": "createdby_id",
  Cost: "cost",
};

const sortControl = reactive<{
  key: keyof Tables<"VehicleServiceLogs">;
  direction: "asc" | "desc";
  options: Array<{
    label?: string;
    value: keyof Tables<"VehicleServiceLogs">;
  }>;
}>({
  key: "date",
  direction: "desc",
  options: [
    { value: "date", label: "Date" },
    { value: "cost", label: "Cost" },
  ],
});

const groupedServices = computed(() => {
  const filtered = services.value || [];
  // .filter(service =>
  //   filters.value.every(filter => applyFilter(service, filter)),
  // );

  const sorted = dynamicSort(filtered, sortControl.key, sortControl.direction);

  const enriched = sorted.map((service) => ({
    ...service,
    monthYear: formatDate(
      service.date,
      sortControl.key === "date"
        ? { year: "numeric", month: "long" }
        : { year: "numeric" }
    ),
  }));

  const grouped = groupBy(enriched, "monthYear");

  return grouped;
});

// const handleFilterApply = async (filterOptions: Array<FilterOption>) => {
//   filters.value = filterOptions;
// };

// const handleFiltersReset = () => {
//   filters.value = [];
// };

const setSortKey = (key: keyof Tables<"VehicleServiceLogs">) => {
  sortControl.key = key;
};

const handleCreateService = () => {
  if (!vehicleId.value) return;
  serviceDialogRef.value?.open(vehicleId.value);
};

const handleFilterApply = async (
  buildFilters: Ref<Array<FilterOption<Tables<"VehicleServiceLogs">>>>
) => {
  // filters.value = buildFilters.value;
};
</script>

<template>
  <div>
    <ServiceDialog ref="serviceDialogRef" />

    <div class="flex justify-between mb-3">
      <button
        type="button"
        class="btn btn-primary w-auto"
        @click="handleCreateService"
      >
        <Icon name="mdi:plus" size="1.2em" />
        Add Service
      </button>

      <div class="flex items-center gap-2">
        <div class="join">
          <ServicesFilterDrawer @applyFilters="handleFilterApply" />
          <!-- <ServicesFilter
            @reset="handleFiltersReset"
            @apply="handleFilterApply"
          /> -->

          <Menu
            btnClass="btn btn-outline join-item"
            :items="
              sortControl.options.map((p) => ({
                label: p.label || p.value,
                checked: sortControl.key === p.value,
                onClick: () => setSortKey(p.value),
              }))
            "
          >
            <template #default>
              <Icon name="mdi:sort" class="sm:block hidden" />
              Sorted on:
              <span class="badge badge-neutral">
                {{
                  sortControl.options.find((o) => o.value === sortControl.key)
                    ?.label
                }}
              </span>
            </template>
          </Menu>
        </div>

        <!-- <ExportButton @export="handleServicesExport" /> -->
      </div>
    </div>

    <ListGroup class="flex-1" ignoreListClass>
      <template v-if="loading">
        loading
        <!-- <ServiceListItemSkeleton v-for="idx in 10" :key="`skeleton-${idx}`" /> -->
      </template>

      <ListSubGroup
        v-for="(services, month) in groupedServices"
        :key="month"
        :title="month.toString()"
      >
        <ServicesListItem
          v-for="(service, index) in services"
          :key="index"
          :service="service"
        />
      </ListSubGroup>
    </ListGroup>
  </div>
</template>
