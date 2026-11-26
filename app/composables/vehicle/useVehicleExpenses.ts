import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "~/types/supabase";

type Row = Tables<"vehicle_expenses_converted">;

export const useVehicleExpenses = (
  vehicleId: MaybeRefOrGetter<Row["vehicle_id"]>,
  filters: MaybeRefOrGetter<FilterOption<Row>[]> = [],
  pageSize = 10,
) => {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedFilters = computed(() => toValue(filters));
  const limit = computed(() => toValue(pageSize));

  const key = computed(() =>
    cacheKeys.expensesFiltered(resolvedVehicleId.value, resolvedFilters.value),
  );

  const offset = ref(0);

  const hasMoreMap = useState<Record<string, boolean>>(
    "expenses_hasMore",
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
        `/api/vehicles/${resolvedVehicleId.value}/expenses/filter`,
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
};

export const useVehicleExpense = (
  vehicleId: MaybeRefOrGetter<Row["vehicle_id"]>,
  expenseId: MaybeRefOrGetter<Row["id"]>,
) => {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedExpenseId = computed(() => toValue(expenseId));

  return useLazyFetch(
    () =>
      `/api/vehicles/${resolvedVehicleId.value}/expenses/${resolvedExpenseId.value}`,
    {
      key: () =>
        cacheKeys.expense(resolvedVehicleId.value, resolvedExpenseId.value),
      method: "get",
      immediate: !!resolvedVehicleId.value && !!resolvedExpenseId.value,
      default: () => {
        const payload = useNuxtApp().payload.data;
        const prefix = cacheKeys.expensesPrefix(resolvedVehicleId.value);
        for (const k of Object.keys(payload)) {
          if (!k.startsWith(prefix)) continue;
          const hit = (payload[k] as Row[] | undefined)?.find(
            (e) => e.id === resolvedExpenseId.value,
          );
          if (hit) return hit;
        }
        return undefined as unknown as Row;
      },
    },
  );
};

export async function createVehicleExpense(
  vehicleId: Row["vehicle_id"],
  patch: TablesInsert<"VehicleExpenses">,
) {
  const expense = await $fetch<Row>(`/api/vehicles/${vehicleId}/expenses`, {
    method: "post",
    body: {
      expense: patch,
    },
  });

  prependToNuxtDataListByPrefix<Row>(
    cacheKeys.expensesPrefix(toValue(vehicleId)),
    expense,
  );

  return expense;
}

export async function updateVehicleExpense(
  vehicleId: Row["vehicle_id"],
  id: Row["id"],
  patch: Partial<TablesUpdate<"VehicleExpenses">>,
) {
  const listPrefix = cacheKeys.expensesPrefix(vehicleId);
  const detailCache = useNuxtData<Row>(cacheKeys.expense(vehicleId, id));

  const listSnapshots = new Map<string, Row[]>();
  for (const k of keysWithPrefix(listPrefix)) {
    listSnapshots.set(k, useNuxtData<Row[]>(k).data.value ?? []);
  }
  const detailSnapshot = detailCache.data.value;

  // Optimistic
  patchNuxtDataListByPrefix<Row>(listPrefix, id, patch);
  if (detailCache.data.value) {
    detailCache.data.value = { ...detailCache.data.value, ...patch };
  }

  try {
    const updated = await $fetch<Row>(
      `/api/vehicles/${vehicleId}/expenses/${id}`,
      { method: "put", body: { expense: patch } },
    );

    detailCache.data.value = updated;
    patchNuxtDataListByPrefix<Row>(listPrefix, id, updated);
    return updated;
  } catch (e) {
    for (const [k, list] of listSnapshots) {
      useNuxtData<Row[]>(k).data.value = list;
    }
    detailCache.data.value = detailSnapshot;
    throw e;
  }
}

export async function deleteVehicleExpense(
  vehicleId: MaybeRefOrGetter<Row["vehicle_id"]>,
  id: MaybeRefOrGetter<Row["id"]>,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedId = computed(() => toValue(id));

  const listPrefix = cacheKeys.expensesPrefix(resolvedVehicleId.value);

  const listSnapshots = new Map<string, Row[]>();
  for (const k of keysWithPrefix(listPrefix)) {
    listSnapshots.set(k, useNuxtData<Row[]>(k).data.value ?? []);
  }

  // Optimistic: row disappears immediately
  removeFromNuxtDataListByPrefix<Row>(listPrefix, resolvedId.value);

  try {
    await $fetch(
      `/api/vehicles/${resolvedVehicleId.value}/expenses/${resolvedId.value}`,
      {
        method: "delete",
      },
    );
    clearNuxtData(cacheKeys.expense(resolvedVehicleId.value, resolvedId.value));
  } catch (e) {
    for (const [k, list] of listSnapshots) {
      useNuxtData<Row[]>(k).data.value = list;
    }
    throw e;
  }
}
