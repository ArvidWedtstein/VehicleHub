import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleServices(
  vehicleId: MaybeRef<string | number | undefined>,
  filters: MaybeRef<
    FilterOption<Tables<"vehicleservicelogs_with_items">>[]
  > = [],
) {
  const vehicleServiceId = computed(() => unref(vehicleId));

  return useFetch<Tables<"vehicleservicelogs_with_items">[]>(
    `/api/vehicles/${vehicleServiceId.value}/services/filter`,
    {
      method: "post",
      key: `vehicle-${vehicleServiceId.value}_services`,
      body: {
        filters: unref(filters),
      },
      immediate: !!unref(vehicleId),
      watch: [vehicleServiceId, () => filters],
      default: () => [],
    },
  );
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
  patch: Partial<TablesUpdate<"VehicleServiceLogs">>,
  itemsPatch?: Partial<TablesUpdate<"VehicleServiceLogsItems">>[],
) {
  const service = await $fetch<Tables<"VehicleServiceLogs">>(
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

  return service;
}

export async function deleteVehicleService(
  vehicleId: MaybeRef<string | number>,
  id: MaybeRef<string | number>,
) {
  await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${unref(vehicleId)}/services/${unref(id)}`,
    {
      method: "delete",
      credentials: "include",
      headers: useRequestHeaders(["cookie"]),
    },
  );

  refreshNuxtData(`vehicle-${unref(vehicleId)}_services`);
  clearNuxtData(`vehicle-${unref(vehicleId)}_service-${unref(id)}`);
}
