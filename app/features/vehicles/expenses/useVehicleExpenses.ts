import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleExpenses(
  vehicleId: MaybeRef<string | number | undefined>,
  filters: MaybeRef<FilterOption<Tables<"VehicleExpenses">>[]> = [],
) {
  return useAsyncData(
    () => `vehicle-${unref(vehicleId)}_expenses`,
    (_nuxtApp, { signal }) =>
      $fetch<Tables<"VehicleExpenses">[]>(
        `/api/vehicles/${unref(vehicleId)}/expenses/filter`,
        {
          method: "post",
          body: {
            filters: unref(filters),
          },
          headers: import.meta.server
            ? useRequestHeaders(["cookie"])
            : undefined,
          signal,
        },
      ),
    {
      default: () => [],
      lazy: true,
    },
  );
}

export const useVehicleExpense = (
  vehicleId?: MaybeRef<Tables<"VehicleExpenses">["vehicle_id"] | undefined>,
  expenseId?: MaybeRef<Tables<"VehicleExpenses">["id"] | undefined>,
) => {
  return useAsyncData(
    () => `vehicle-${unref(vehicleId)}_expense-${unref(expenseId)}`,
    (_nuxtApp, { signal }) =>
      $fetch<Tables<"VehicleExpenses">>(
        `/api/vehicles/${unref(vehicleId)}/expenses/${unref(expenseId)}`,
        {
          method: "get",
          headers: import.meta.server
            ? useRequestHeaders(["cookie"])
            : undefined,
          signal,
        },
      ),
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
      credentials: "include",
      headers: useRequestHeaders(["cookie"]),
    },
  );

  refreshNuxtData(`vehicle-${vehicleId}_expenses`);
  clearNuxtData(`vehicle-${vehicleId}_expense-${id}`);
}
