import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleServices(
  vehicleId: MaybeRefOrGetter<Tables<"VehicleServiceLogs">["vehicle_id"]>,
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
      key: () => cacheKeys.services(resolvedVehicleId.value),
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
  vehicleId: MaybeRefOrGetter<Tables<"VehicleServiceLogs">["vehicle_id"]>,
  id: MaybeRefOrGetter<Tables<"VehicleServiceLogs">["id"]>,
) => {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedId = computed(() => toValue(id));

  return useLazyFetch<
    Tables<"VehicleServiceLogs"> & {
      totalCost: number;
      items: Tables<"VehicleServiceLogsItems">[];
      files: Tables<"VehicleDocuments">[];
    }
  >(
    () =>
      `/api/vehicles/${resolvedVehicleId.value}/services/${resolvedId.value}`,
    {
      key: () => cacheKeys.service(resolvedVehicleId.value, resolvedId.value),
      method: "get",
      immediate: !!resolvedId.value && !!resolvedVehicleId.value,
    },
  );
};

export async function createVehicleService(
  vehicleId: MaybeRefOrGetter<Tables<"VehicleServiceLogs">["vehicle_id"]>,
  patch: Partial<TablesInsert<"VehicleServiceLogs">>,
  itemsPatch?: Partial<TablesInsert<"VehicleServiceLogsItems">>[],
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const service = await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${resolvedVehicleId.value}/services`,
    {
      method: "post",
      body: {
        service: patch,
        items: itemsPatch,
      },
    },
  );
  await refreshNuxtData(cacheKeys.services(resolvedVehicleId.value));

  return service;
}

export async function updateVehicleService(
  vehicleId: Tables<"VehicleServiceLogs">["vehicle_id"],
  id: Tables<"VehicleServiceLogs">["id"],
  patch: TablesUpdate<"VehicleServiceLogs">,
  itemsPatch?: Partial<TablesUpdate<"VehicleServiceLogsItems">>[],
  removedItemIds?: Pick<TablesUpdate<"VehicleServiceLogsItems">, "id">[],
) {
  const listCache = useNuxtData<Tables<"VehicleServiceLogs">[]>(
    cacheKeys.services(vehicleId),
  );
  let previousList: Tables<"VehicleServiceLogs">[] = [];

  const updated = await $fetch<
    Tables<"VehicleServiceLogs"> & {
      totalCost: number;
      items: Tables<"VehicleServiceLogsItems">[];
      files: Tables<"VehicleDocuments">[];
    }
  >(`/api/vehicles/${vehicleId}/services/${id}`, {
    method: "put",
    body: {
      service: patch,
      items: itemsPatch,
      removedItemIds: removedItemIds,
    },
    onRequest() {
      previousList = listCache.data.value || [];

      patchNuxtDataItem(cacheKeys.service(vehicleId, id), patch);
      patchNuxtDataList(cacheKeys.services(vehicleId), id, patch);
    },
    onResponseError() {
      listCache.data.value = previousList;

      refreshNuxtData(cacheKeys.service(vehicleId, id));
    },
    onResponse({ response }) {
      patchNuxtDataList(cacheKeys.services(vehicleId), id, response._data);
    },
  });

  patchNuxtDataItem(cacheKeys.service(vehicleId, id), updated);
  patchNuxtDataList(
    cacheKeys.services(vehicleId),
    id,
    omit(updated, ["items", "files"]),
  );

  return updated;
}

export async function deleteVehicleService(
  vehicleId: MaybeRefOrGetter<Tables<"VehicleServiceLogs">["vehicle_id"]>,
  id: MaybeRefOrGetter<Tables<"VehicleServiceLogs">["id"]>,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedId = computed(() => toValue(id));

  await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${resolvedVehicleId.value}/services/${resolvedId.value}`,
    {
      method: "delete",
    },
  );

  removeFromNuxtDataList(
    cacheKeys.services(resolvedVehicleId.value),
    resolvedId.value,
  );

  clearNuxtData(cacheKeys.service(resolvedVehicleId.value, resolvedId.value));
}
