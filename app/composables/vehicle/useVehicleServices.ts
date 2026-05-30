import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleServices(
  vehicleId: MaybeRefOrGetter<string | number | undefined>,
  filters: MaybeRefOrGetter<
    FilterOption<Tables<"vehicleservicelogs_with_items">>[]
  > = [],
  pageSize: MaybeRefOrGetter<number> = 10,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedFilters = computed(() => toValue(filters));
  const limit = computed(() => toValue(pageSize));

  const offset = ref(0);
  const hasMore = ref(true);

  const data = ref<Tables<"vehicleservicelogs_with_items">[]>([]);

  const {
    data: items,
    pending,
    status,
    refresh,
  } = useFetch<Tables<"vehicleservicelogs_with_items">[]>(
    () => `/api/vehicles/${resolvedVehicleId.value}/services/filter`,
    {
      method: "post",
      key: () => `vehicle-${resolvedVehicleId.value}_services`,
      body: computed(() => ({
        filters: resolvedFilters.value,
        pagination: {
          limit: limit.value,
          offset: offset.value,
        },
      })),
      lazy: true,
      immediate: !!resolvedVehicleId.value,
      default: () => [],
    },
  );

  watch(items, (newPage) => {
    if (!newPage) return;

    data.value = offset.value === 0 ? newPage : [...data.value, ...newPage];

    hasMore.value = newPage.length >= limit.value && limit.value !== -1;
  });

  watch([resolvedVehicleId, resolvedFilters], () => {
    offset.value = 0;
    data.value = [];
    hasMore.value = true;
    refresh();
  });

  const loadMore = () => {
    if (!pending.value && hasMore.value) offset.value += limit.value;
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
  >(() => `/api/vehicles/${unref(vehicleId)}/services/${unref(id)}`, {
    key: () => `vehicle-${unref(vehicleId)}_service-${unref(id)}`,
    method: "get",
    lazy: true,
    immediate: !!unref(id) && !!unref(vehicleId),
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
  await refreshNuxtData(`vehicle-${unref(vehicleId)}_services`);

  return service;
}

export async function updateVehicleService(
  vehicleId: string | number,
  id: string | number,
  patch: TablesUpdate<"VehicleServiceLogs">,
  itemsPatch?: Partial<TablesUpdate<"VehicleServiceLogsItems">>[],
  removedItemIds?: Pick<TablesUpdate<"VehicleServiceLogsItems">, "id">[],
) {
  const updated = await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${vehicleId}/services/${id}`,
    {
      method: "put",
      body: {
        service: patch,
        items: itemsPatch,
        removedItemIds: removedItemIds,
      },
    },
  );

  const single = useNuxtData<typeof updated>(
    `vehicle-${vehicleId}_service-${id}`,
  );
  if (single.data.value) {
    single.data.value = { ...single.data.value, ...updated };
  }

  const list = useNuxtData<Tables<"vehicleservicelogs_with_items">[]>(
    `vehicle-${vehicleId}_services`,
  );
  if (list.data.value) {
    list.data.value = list.data.value.map((s) =>
      s.id === id ? { ...s, ...updated } : s,
    );
  }

  return updated;
}

export async function deleteVehicleService(
  vehicleId: MaybeRef<string | number>,
  id: MaybeRef<string | number>,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedId = computed(() => toValue(id));

  await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${resolvedVehicleId.value}/services/${resolvedId.value}`,
    {
      method: "delete",
    },
  );

  const list = useNuxtData<Tables<"vehicleservicelogs_with_items">[]>(
    `vehicle-${resolvedVehicleId.value}_services`,
  );
  if (list.data.value) {
    list.data.value = list.data.value.filter(
      (service) => service.id !== resolvedId.value,
    );
  }

  clearNuxtData(
    `vehicle-${resolvedVehicleId.value}_service-${resolvedId.value}`,
  );
}
