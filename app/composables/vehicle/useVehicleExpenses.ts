import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export const useVehicleExpenses = (
  vehicleId: MaybeRef<string | number | undefined>,
  filters: MaybeRef<FilterOption<Tables<"VehicleExpenses">>[]> = [],
  pagination: { limit: number; offset: number } = { limit: 20, offset: 0 },
) => {
  return useFetch<Tables<"VehicleExpenses">[]>(
    `/api/vehicles/${unref(vehicleId)}/expenses/filter`,
    {
      key: () => `vehicle-${unref(vehicleId)}_expenses`,
      method: "post",
      body: {
        filters: unref(filters),
        pagination,
      },
      lazy: true,
      default: () => [],
    },
  );
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
