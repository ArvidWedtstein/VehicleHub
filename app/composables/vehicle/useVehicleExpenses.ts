import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export const useVehicleExpenses = (
  vehicleId: MaybeRef<Tables<"VehicleExpenses">["vehicle_id"]>,
  filters: MaybeRef<FilterOption<Tables<"VehicleExpenses">>[]> = [],
  pageSize = 10,
) => {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedFilters = computed(() => toValue(filters));
  const limit = computed(() => toValue(pageSize));

  const offset = ref(0);
  const hasMore = ref(true);

  const data = ref<Tables<"VehicleExpenses">[]>([]);

  const {
    data: items,
    pending,
    status,
    refresh,
  } = useFetch<Tables<"VehicleExpenses">[]>(
    () => `/api/vehicles/${resolvedVehicleId.value}/expenses/filter`,
    {
      key: () => cacheKeys.expenses(resolvedVehicleId.value),
      method: "post",
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

    // First page = replace
    if (offset.value === 0) {
      data.value = newPage;
    } else {
      data.value = [...data.value, ...newPage];
    }

    if (newPage.length < limit.value || limit.value === -1) {
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
};

export const useVehicleExpense = (
  vehicleId: MaybeRefOrGetter<Tables<"VehicleExpenses">["vehicle_id"]>,
  expenseId: MaybeRefOrGetter<Tables<"VehicleExpenses">["id"]>,
) => {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedExpenseId = computed(() => toValue(expenseId));

  const listCache = useNuxtData<Tables<"VehicleExpenses">[]>(
    cacheKeys.expenses(resolvedVehicleId.value),
  );

  return useLazyFetch(
    `/api/vehicles/${resolvedVehicleId.value}/expenses/${resolvedExpenseId.value}`,
    {
      key: () =>
        cacheKeys.expense(resolvedVehicleId.value, resolvedExpenseId.value),
      method: "get",
      immediate: !!resolvedVehicleId.value && !!resolvedExpenseId.value,
      default: () =>
        listCache.data.value?.find((e) => e.id === resolvedExpenseId.value),
    },
  );
};

export async function createVehicleExpense(
  vehicleId: Tables<"VehicleExpenses">["vehicle_id"],
  patch: Partial<TablesInsert<"VehicleExpenses">>,
) {
  const expense = await $fetch<Tables<"VehicleExpenses">>(
    `/api/vehicles/${vehicleId}/expenses`,
    {
      method: "post",
      body: {
        expense: patch,
      },
    },
  );

  await refreshNuxtData(cacheKeys.expenses(vehicleId));

  return expense;
}

export async function updateVehicleExpense(
  vehicleId: Tables<"VehicleExpenses">["vehicle_id"],
  id: Tables<"VehicleExpenses">["id"],
  patch: Partial<TablesUpdate<"VehicleExpenses">>,
) {
  const updated = await $fetch<Tables<"VehicleExpenses">>(
    `/api/vehicles/${vehicleId}/expenses/${id}`,
    {
      method: "put",
      body: patch,
    },
  );

  patchNuxtDataList(cacheKeys.expenses(vehicleId), id, updated);

  return updated;
}

export async function deleteVehicleExpense(
  vehicleId: MaybeRefOrGetter<Tables<"VehicleExpenses">["vehicle_id"]>,
  id: MaybeRefOrGetter<Tables<"VehicleExpenses">["id"]>,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedId = computed(() => toValue(id));

  await $fetch<Tables<"VehicleExpenses">>(
    `/api/vehicles/${resolvedVehicleId.value}/expenses/${resolvedId.value}`,
    {
      method: "delete",
    },
  );

  removeFromNuxtDataList(
    cacheKeys.expenses(resolvedVehicleId.value),
    resolvedId.value,
  );
}
