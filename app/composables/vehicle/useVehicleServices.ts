import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

type Row = Tables<"vehicleservicelogs_with_items">;

export function useVehicleServices(
  vehicleId: MaybeRefOrGetter<Row["vehicle_id"]>,
  filters: MaybeRefOrGetter<FilterOption<Row>[]> = [],
  pageSize: MaybeRefOrGetter<number> = 10,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedFilters = computed(() => toValue(filters));
  const limit = computed(() => toValue(pageSize));

  const key = computed(() =>
    cacheKeys.servicesFiltered(resolvedVehicleId.value, resolvedFilters.value),
  );

  const offset = ref(0);

  const hasMoreMap = useState<Record<string, boolean>>(
    "services_hasMore",
    () => ({}),
  );
  const hasMore = computed(() => hasMoreMap.value[key.value] ?? true);

  let appendNext = false;

  const { data, pending, status, refresh } = useAsyncData<Row[]>(
    () => key.value,
    async (): Promise<Row[]> => {
      if (!resolvedVehicleId.value) return [];

      const append = appendNext;
      appendNext = false;

      const currentKey = key.value;
      const current = data.value ?? [];
      const offset = append ? current.length : 0;

      const page = await $fetch<Row[]>(
        `/api/vehicles/${resolvedVehicleId.value}/services/filter`,
        {
          method: "post",
          body: {
            filters: resolvedFilters.value,
            pagination: { limit: limit.value, offset: offset },
          },
        },
      );

      hasMoreMap.value = {
        ...hasMoreMap.value,
        [currentKey]: limit.value !== -1 && page.length >= limit.value,
      };

      if (!append) return page;

      const seen = new Set(current.map((r) => r.id));
      return [...current, ...page.filter((r) => !seen.has(r.id))];
    },
    {
      lazy: true,
      default: () => [],
      immediate: !!resolvedVehicleId.value,
      getCachedData: (key, nuxtApp, ctx) => {
        if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook")
          return undefined;
        return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
      },
    },
  );

  const loadMore = () => {
    if (pending.value || !hasMore.value) return;
    appendNext = true;
    return refresh();
  };

  const reset = () => {
    appendNext = false;
    return refresh();
  };

  return {
    data,
    pending,
    status,
    loadMore,
    refresh,
    reset,
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
  const service = await $fetch<Row>(
    `/api/vehicles/${resolvedVehicleId.value}/services`,
    {
      method: "post",
      body: {
        service: patch,
        items: itemsPatch,
      },
    },
  );

  prependToNuxtDataListByPrefix<Row>(
    cacheKeys.servicesPrefix(toValue(vehicleId)),
    service,
  );

  return service;
}

type ServiceDetail = Tables<"VehicleServiceLogs"> & {
  totalCost: number;
  items: Tables<"VehicleServiceLogsItems">[];
  files: Tables<"VehicleDocuments">[];
};

export async function updateVehicleService(
  vehicleId: Tables<"VehicleServiceLogs">["vehicle_id"],
  id: Tables<"VehicleServiceLogs">["id"],
  patch: TablesUpdate<"VehicleServiceLogs">,
  itemsPatch?: Partial<TablesUpdate<"VehicleServiceLogsItems">>[],
  removedItemIds?: Pick<TablesUpdate<"VehicleServiceLogsItems">, "id">[],
) {
  const listPrefix = cacheKeys.servicesPrefix(vehicleId);
  const detailKey = cacheKeys.service(vehicleId, id);

  // Snapshot every cached list plus the detail (safe without cloning: helpers replace, never mutate)
  const listSnapshots = new Map<string, Row[]>();
  for (const k of keysWithPrefix(listPrefix)) {
    listSnapshots.set(k, useNuxtData<Row[]>(k).data.value ?? []);
  }
  const detailCache = useNuxtData<ServiceDetail>(detailKey);
  const detailSnapshot = detailCache.data.value;

  patchNuxtDataListByPrefix<Row>(listPrefix, id, patch, {
    existingKeysOnly: true,
  });
  if (detailCache.data.value) {
    detailCache.data.value = {
      ...detailCache.data.value,
      ...patch,
      // only touch items when the caller actually changed them
      ...(itemsPatch
        ? {
            items: applyItemsPatch(
              detailCache.data.value.items,
              itemsPatch,
              removedItemIds,
            ),
          }
        : {}),
    };
  }

  try {
    const updated = await $fetch<ServiceDetail>(
      `/api/vehicles/${vehicleId}/services/${id}`,
      {
        method: "put",
        body: { service: patch, items: itemsPatch, removedItemIds },
      },
    );

    detailCache.data.value = updated;
    patchNuxtDataListByPrefix<Row>(listPrefix, id, updated, {
      existingKeysOnly: true,
    });
    return updated;
  } catch (e) {
    for (const [k, list] of listSnapshots)
      useNuxtData<Row[]>(k).data.value = list;
    detailCache.data.value = detailSnapshot;
    throw e;
  }
}

function applyItemsPatch(
  current: Tables<"VehicleServiceLogsItems">[],
  patches: Partial<TablesUpdate<"VehicleServiceLogsItems">>[],
  removed: Pick<TablesUpdate<"VehicleServiceLogsItems">, "id">[] = [],
) {
  const removedIds = new Set(removed.map((r) => r.id));
  const byId = new Map(
    patches.filter((p) => p.id != null).map((p) => [p.id, p]),
  );
  const kept = current
    .filter((i) => !removedIds.has(i.id))
    .map((i) => ({ ...i, ...byId.get(i.id) }));
  const added = patches.filter(
    (p) => p.id == null,
  ) as Tables<"VehicleServiceLogsItems">[];
  return [...kept, ...added];
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
