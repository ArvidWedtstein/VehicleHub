import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleServices(
  vehicleId: MaybeRef<string | number | undefined>,
  filters: MaybeRef<FilterOption<Tables<"VehicleExpenses">>[]> = []
) {
  return useAsyncData(
    `vehicle-${unref(vehicleId)}_services`,
    async () => {
      return await $fetch<Tables<"VehicleServiceLogs">[]>(
        `/api/vehicles/${unref(vehicleId)}/services/filter`,
        {
          method: "post",
          body: {
            filters: unref(filters),
          },
          credentials: "include",
          // headers: useRequestHeaders(["cookie"]),
        }
      );
    },
    {
      default: () => [],
    }
  );
}

export const useVehicleService = (
  vehicleId: MaybeRef<string | number | undefined>,
  id?: MaybeRef<string | number | undefined>
) => {
  return useAsyncData(
    `vehicle-${unref(vehicleId)}_service-${unref(id)}`,
    async () => {
      return await $fetch<
        Tables<"VehicleServiceLogs"> & {
          items: Tables<"VehicleServiceLogsItems">[];
          files: Tables<"VehicleDocuments">[];
        }
      >(`/api/vehicles/${unref(vehicleId)}/services/${unref(id)}`, {
        method: "get",
        headers: useRequestHeaders(["cookie"]),
      });
    }
  );
};

export async function createVehicleService(
  vehicleId: MaybeRef<string | number | undefined>,
  patch: Partial<TablesInsert<"VehicleServiceLogs">>,
  itemsPatch?: Partial<TablesInsert<"VehicleServiceLogsItems">>[]
) {
  const service = await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${unref(vehicleId)}/services`,
    {
      method: "post",
      body: {
        service: patch,
        items: itemsPatch,
      },
    }
  );
  refreshNuxtData(`vehicle-${unref(vehicleId)}_services`);

  return service;
}

export async function updateVehicleService(
  vehicleId: string | number,
  id: string | number,
  patch: Partial<TablesUpdate<"VehicleServiceLogs">>,
  itemsPatch?: Partial<TablesUpdate<"VehicleServiceLogsItems">>[]
) {
  const service = await $fetch<Tables<"VehicleServiceLogs">>(
    `/api/vehicles/${vehicleId}/services/${id}`,
    {
      method: "put",
      body: {
        service: patch,
        items: itemsPatch,
      },
    }
  );
  refreshNuxtData(`vehicle-${vehicleId}_services`);
  refreshNuxtData(`vehicle-${vehicleId}_service-${id}`);

  return service;
}
