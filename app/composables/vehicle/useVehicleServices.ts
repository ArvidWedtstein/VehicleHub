import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleServices(
  vehicleId: MaybeRef<string | number | undefined>,
  filters: MaybeRef<
    FilterOption<Tables<"vehicleservicelogs_with_items">>[]
  > = [],
  pageSize = 10,
) {
  const resolvedVehicleId = computed(() => unref(vehicleId));
  const resolvedFilters = computed(() => unref(filters));

  const limit = computed(() => unref(pageSize));

  const key = computed(() =>
    [
      "vehicle-services",
      resolvedVehicleId.value,
      limit.value,
      offset.value,
      JSON.stringify(resolvedFilters.value),
    ].join(":"),
  );
  const offset = ref(0);
  const hasMore = ref(true);

  const data = ref<Tables<"vehicleservicelogs_with_items">[]>([]);

  const {
    data: items,
    pending,
    status,
    refresh,
  } = useFetch<Tables<"vehicleservicelogs_with_items">[]>(
    `/api/vehicles/${resolvedVehicleId.value}/services/filter`,
    {
      method: "post",
      key,
      body: computed(() => ({
        filters: resolvedFilters.value,
        pagination: {
          limit: limit.value,
          offset: offset.value,
        },
      })),
      immediate: !!resolvedVehicleId.value,
      default: () => [],
    },
  );

  watch(items, (newPage) => {
    if (!newPage) return;

    // First page = replace
    if (offset.value === 0) {
      data.value = newPage;
    } else {
      data.value = [...data.value, ...newPage];
    }

    if (newPage.length < limit.value) {
      hasMore.value = false;
    }
  });

  watch([resolvedVehicleId, resolvedFilters], () => {
    offset.value = 0;
    data.value = [];
    hasMore.value = true;
    refresh();
  });

  const loadMore = () => {
    if (pending.value) return;
    offset.value += limit.value;
  };

  return {
    data,
    pending,
    status,
    loadMore,
    refresh,
    offset,
    hasMore,
  };
}

export const useVehicleService = (
  vehicleId: MaybeRef<string | number | undefined>,
  id?: MaybeRef<string | number | undefined>,
) => {
  return useFetch<
    Tables<"VehicleServiceLogs"> & {
      totalCost: number;
      items: Tables<"VehicleServiceLogsItems">[];
      files: Tables<"VehicleDocuments">[];
    }
  >(`/api/vehicles/${unref(vehicleId)}/services/${unref(id)}`, {
    key: `vehicle-${unref(vehicleId)}_service-${unref(id)}`,
    method: "get",
    immediate: !!unref(id) && !!unref(vehicleId),
    watch: [() => vehicleId, () => id],
  });
};

export async function createVehicleService(
  vehicleId: MaybeRef<string | number | undefined>,
  patch: Partial<TablesInsert<"VehicleServiceLogs">>,
  itemsPatch?: Partial<TablesInsert<"VehicleServiceLogsItems">>[],
) {
  const service = await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${unref(vehicleId)}/services`,
    {
      method: "post",
      body: {
        service: patch,
        items: itemsPatch,
      },
    },
  );
  refreshNuxtData(`vehicle-${unref(vehicleId)}_services`);

  return service;
}

export async function updateVehicleService(
  vehicleId: string | number,
  id: string | number,
  patch: TablesUpdate<"VehicleServiceLogs">,
  itemsPatch?: Partial<TablesUpdate<"VehicleServiceLogsItems">>[],
) {
  await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${vehicleId}/services/${id}`,
    {
      method: "put",
      body: {
        service: patch,
        items: itemsPatch,
      },
    },
  );
  refreshNuxtData(`vehicle-${vehicleId}_services`);
  refreshNuxtData(`vehicle-${vehicleId}_service-${id}`);
}

export async function deleteVehicleService(
  vehicleId: MaybeRef<string | number>,
  id: MaybeRef<string | number>,
) {
  await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${unref(vehicleId)}/services/${unref(id)}`,
    {
      method: "delete",
    },
  );

  refreshNuxtData(`vehicle-${unref(vehicleId)}_services`);
  clearNuxtData(`vehicle-${unref(vehicleId)}_service-${unref(id)}`);
}
