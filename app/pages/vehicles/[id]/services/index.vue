<script setup lang="ts">
import ServiceDialog from "~/components/vehicle/service/dialog/ServiceDialog.vue";
import ExportButton from "~/features/vehicles/ExportButton.vue";
import ServicesFilterDrawer from "~/features/vehicles/services/ServicesFilterDrawer.vue";
import ServicesListItem from "~/features/vehicles/services/ServicesListItem.vue";
import { useVehicleServices } from "~/features/vehicles/services/useVehicleServices";
import type { Tables } from "~/types/supabase";

useHead({
  title: "Services",
});
definePageMeta({
  auth: true,
  layout: "vehicle",
});

const vehicleId = useRouteParam("id", "number");

const filters = ref<FilterOption<Tables<"VehicleServiceLogs">>[]>([]);

const {
  data: services,
  refresh,
  pending: loading,
} = useVehicleServices(vehicleId, filters);

const overlay = useOverlay();
const vehicleServiceDialog = overlay.create(ServiceDialog);

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

  const sorted = dynamicSort(filtered, sortControl.key, sortControl.direction);

  const enriched = sorted.map((service) => ({
    ...service,
    monthYear: formatDate(
      service.date || "",
      sortControl.key === "date"
        ? { year: "numeric", month: "long" }
        : { year: "numeric" },
    ),
  }));

  const grouped = groupBy(enriched, "monthYear");

  return grouped;
});

const setSortKey = (key: keyof Tables<"VehicleServiceLogs">) => {
  sortControl.key = key;
};

const handleCreateService = async () => {
  if (!vehicleId.value) return;

  vehicleServiceDialog.open({ vehicleId: vehicleId.value });
};

const handleFilterApply = async (
  buildFilters: Ref<Array<FilterOption<Tables<"VehicleServiceLogs">>>>,
) => {
  filters.value = buildFilters.value;
  refresh();
};
</script>

<template>
  <div>
    <div class="flex justify-between mb-3">
      <UButton icon="mdi:plus" label="Add" @click="handleCreateService" />

      <div class="flex items-center gap-2">
        <div class="join">
          <ServicesFilterDrawer @applyFilters="handleFilterApply" />

          <ResponsiveMenu
            :items="
              sortControl.options.map((p) => ({
                label: p.label || p.value,
                value: p.value,
                active: sortControl.key === p.value,
                onClick: () => setSortKey(p.value),
              }))
            "
          >
            <template #default="{ toggle }">
              <button
                type="button"
                class="btn btn-outline join-item"
                @click="toggle()"
              >
                <Icon name="mdi:sort" />
                <span class="sm:block hidden">Sorted on:</span>
                <span class="badge badge-neutral">
                  {{
                    sortControl.options.find((o) => o.value === sortControl.key)
                      ?.label
                  }}
                </span>
              </button>
            </template>
          </ResponsiveMenu>
        </div>

        <ExportButton @export="handleServicesExport" />
      </div>
    </div>

    <ListGroup class="flex-1 overflow-hidden mb-16" ignoreListClass>
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
