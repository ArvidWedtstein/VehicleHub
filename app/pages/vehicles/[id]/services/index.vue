<script setup lang="ts">
import ServiceDialog from "~/components/vehicle/service/dialog/ServiceDialog.vue";
import type { Tables } from "~/types/supabase";

useHead({
  title: "Services",
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

  const grouped = Object.values(groupBy(enriched, "monthYear"));

  return grouped;
});

const getServiceIcon = (
  serviceType?: Tables<"VehicleServiceLogs">["type"] | null,
) => {
  if (!serviceType) return;

  const type = serviceType.toLowerCase();
  switch (type) {
    case "wheel":
      return "mdi:tire";
    case "brakes":
      return "mdi:car-brake-worn-linings";
    case "light":
      return "mdi:car-light-high";
    case "coolant":
      return "mdi:car-coolant-level";
    case "ac":
    case "aircondition":
      return "mdi:air-conditioner";
    case "wiper":
      return "mdi:wiper-wash";
    case "clutch":
    case "esp":
      return `mdi:car-${type}`;
    case "tire":
    case "oil":
    case "piston":
    case "fuse":
    case "engine":
    case "fan":
    case "seatbelt":
    case "airbag":
      return `mdi:${type}`;
    default:
      return "mdi:wrench";
  }
};

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
  <UPage class="flex-1 p-2 overflow-hidden">
    <div class="flex justify-between mb-3">
      <UButton icon="mdi:plus" label="Add" @click="handleCreateService" />

      <div class="flex items-center gap-2">
        <VehicleServiceFilterDrawer @applyFilters="handleFilterApply" />

        <ResponsiveMenu
          title="Sort By"
          :items="
            sortControl.options.map((p) => ({
              label: p.label || p.value,
              value: p.value,
              active: sortControl.key === p.value,
              onSelect: () => setSortKey(p.value),
            }))
          "
        >
          <UButton icon="mdi:sort" variant="outline" color="secondary">
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

        <!-- <ExportButton @export="handleServicesExport" /> -->
      </div>
    </div>

    <LazyUEmpty
      v-if="!services.length"
      title="No services Found"
      description="It looks like you haven't added any services. Create one to get started."
      :actions="[
        {
          icon: 'mdi:plus',
          label: 'Create new',
          onClick: handleCreateService,
        },
        {
          icon: 'mdi:refresh',
          label: 'Refresh',
          color: 'neutral',
          variant: 'subtle',
          loading: loading,
          loadingAuto: true,
          onClick: () => refresh(),
        },
      ]"
    />

    <UScrollArea
      ref="scrollArea"
      class="w-full min-h-0 flex-1 h-[calc(100dvh-var(--ui-header-height)-9rem)]"
      :items="services"
      :virtualize="{
        estimateSize: 92,
        skipMeasurement: true,
      }"
      v-slot="{ item, index }"
    >
      <!-- <USeparator
        :label="services[0]?.monthYear || ''"
        orientation="horizontal"
        :key="index"
        size="lg"
      /> -->

      <div
        v-if="status === 'pending' || status === 'idle'"
        class="flex items-center gap-4 p-4 sm:p-6"
      >
        <USkeleton class="size-12 rounded-full" />

        <div class="grid gap-2">
          <USkeleton class="h-4 w62.5" />
          <USkeleton class="h-4 w-50" />
        </div>
      </div>

      <!-- <UPageList> -->
      <UPageCard
        v-else
        :key="index"
        variant="ghost"
        :title="item.type || ''"
        :to="{
          name: 'vehicles-id-services-serviceId',
          params: { id: item.vehicle_id, serviceId: item.id },
        }"
        :ui="{ body: 'flex items-center justify-between w-full' }"
      >
        <template #body>
          <UUser
            :avatar="{
              icon: getServiceIcon(item.type),
            }"
            :name="item.type || 'Unknown Expense'"
            :description="
              formatDate(item.date || '', {
                dateStyle: 'medium',
              })
            "
            size="xl"
          />

          <UIcon name="mdi:chevron-right" class="size-8" />
        </template>
      </UPageCard>
      <!-- </UPageList> -->
    </UScrollArea>
  </UPage>
</template>
