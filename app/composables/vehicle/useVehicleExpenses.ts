import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export const useVehicleExpenses = (
  vehicleId: MaybeRef<string | number | undefined>,
  filters: MaybeRef<FilterOption<Tables<"VehicleExpenses">>[]> = [],
  pageSize = 10,
) => {
  const resolvedVehicleId = computed(() => unref(vehicleId));
  const resolvedFilters = computed(() => unref(filters));
  const limit = computed(() => unref(pageSize));

  const key = computed(() =>
    [
      "vehicle-expenses",
      resolvedVehicleId.value,
      limit.value,
      offset.value,
      JSON.stringify(resolvedFilters.value),
    ].join(":"),
  );
  const offset = ref(0);
  const hasMore = ref(true);

  const data = ref<Tables<"VehicleExpenses">[]>([]);

  const {
    data: items,
    pending,
    status,
    refresh,
  } = useFetch<Tables<"VehicleExpenses">[]>(
    `/api/vehicles/${resolvedVehicleId.value}/expenses/filter`,
    {
      key,
      method: "post",
      body: computed(() => ({
        filters: resolvedFilters.value,
        pagination: {
          limit: limit.value,
          offset: offset.value,
        },
      })),
      lazy: true,
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
};

export const useVehicleExpense = (
  vehicleId?: MaybeRef<Tables<"VehicleExpenses">["vehicle_id"] | undefined>,
  expenseId?: MaybeRef<Tables<"VehicleExpenses">["id"] | undefined>,
) => {
  return useFetch(
    `/api/vehicles/${unref(vehicleId)}/expenses/${unref(expenseId)}`,
    {
      key: () => `vehicle-${unref(vehicleId)}_expense-${unref(expenseId)}`,
      method: "get",
    },
  );
};

export async function createVehicleExpense(
  vehicleId: string | number,
  patch: Partial<TablesInsert<"VehicleExpenses">>,
) {
  const expense = await $fetch<Tables<"VehicleExpenses">>(
    `/api/vehicles/${vehicleId}/expenses`,
    {
      method: "post",
      body: patch,
    },
  );
  refreshNuxtData(`vehicle-${vehicleId}_expenses`);

  return expense;
}

export async function updateVehicleExpense(
  vehicleId: string | number,
  id: string | number,
  patch: Partial<TablesUpdate<"VehicleExpenses">>,
) {
  const expense = await $fetch<Tables<"VehicleExpenses">>(
    `/api/vehicles/${vehicleId}/expenses/${id}`,
    {
      method: "put",
      body: patch,
    },
  );
  refreshNuxtData(`vehicle-${vehicleId}_expenses`);
  refreshNuxtData(`vehicle-${vehicleId}_expense-${id}`);

  return expense;
}

export async function deleteVehicleExpense(
  vehicleId: string | number,
  id: string | number,
) {
  await $fetch<Tables<"VehicleExpenses">>(
    `/api/vehicles/${vehicleId}/expenses/${id}`,
    {
      method: "delete",
    },
  );

  refreshNuxtData(`vehicle-${vehicleId}_expenses`);
  clearNuxtData(`vehicle-${vehicleId}_expense-${id}`);
}
