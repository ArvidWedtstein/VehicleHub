<script setup lang="ts">
import ServiceDialog from "~/components/vehicle/service/dialog/ServiceDialog.vue";
import ServicesListItem from "~/features/vehicles/services/ServicesListItem.vue";
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
  loadMore,
  pending: loading,
  status,
  offset,
  hasMore,
} = useVehicleServices(vehicleId, filters, 10);

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
const groupedServices2 = computed(() => {
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

  const grouped = Object.values(groupBy(enriched, "monthYear"));

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

const scrollArea = useTemplateRef("scrollArea");

onMounted(() => {
  useInfiniteScroll(
    scrollArea.value?.$el,
    () => {
      if (!hasMore.value) return;
      loadMore();
      console.log("Load more", offset.value);
    },
    {
      direction: "bottom",
      distance: 200,
      canLoadMore: () => {
        return status.value !== "pending" && !loading.value && hasMore.value;
      },
    },
  );
});
</script>

<template>
  <div>
    <div class="flex justify-between mb-3">
      <UButton icon="mdi:plus" label="Add" @click="handleCreateService" />

      <div class="flex items-center gap-2">
        <VehicleServiceFilterDrawer @applyFilters="handleFilterApply" />

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
          <UButton
            label="Sort"
            icon="mdi:sort"
            variant="outline"
            color="secondary"
          >
            <template #trailing>
              <UBadge
                :label="
                  sortControl.options.find((o) => o.value === sortControl.key)
                    ?.label
                "
                color="neutral"
                variant="soft"
                size="sm"
              />
            </template>
          </UButton>
        </ResponsiveMenu>

        <ExportButton @export="handleServicesExport" />
      </div>
    </div>

    {{ services.length }}

    <UScrollArea
      ref="scrollArea"
      class="w-full h-100"
      :items="groupedServices2"
      v-slot="{ item: services, index }"
    >
      <USeparator
        :label="services[0]?.monthYear || ''"
        orientation="horizontal"
        :key="index"
        size="lg"
      />
      <UPageList>
        <UPageCard
          v-for="(item, idx) in services"
          :key="idx"
          variant="ghost"
          :title="item.type || ''"
          href="/"
        >
          <template #body>
            <UUser
              :avatar="{
                icon: item.type === 'Fuel' ? 'mdi:gas-station' : 'mdi:cash',
              }"
              :name="item.type || 'Unknown Expense'"
              :description="
                formatDate(item.date || '', {
                  dateStyle: 'medium',
                })
              "
              size="xl"
            />
          </template>
        </UPageCard>
      </UPageList>
    </UScrollArea>

    <!-- <ListGroup class="flex-1 overflow-hidden mb-16" ignoreListClass>
      <template v-if="loading">
        loading
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
    </ListGroup> -->
  </div>
</template>
