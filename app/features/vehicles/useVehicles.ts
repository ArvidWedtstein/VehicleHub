import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

// export function useVehicles(filters: FilterOption<Tables<"Vehicles">>[] = []) {
//   return useAsyncData(
//     "vehicles",
//     (_nuxtApp, { signal }) =>
//       $fetch<Tables<"Vehicles">[]>("/api/vehicles/filter", {
//         method: "post",
//         body: {
//           filters,
//         },
//         credentials: "include",
//         headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
//         signal,
//       }),
//     { default: () => [] },
//   );
// }

export function useVehicles(filters: FilterOption<Tables<"Vehicles">>[] = []) {
  return useFetch<Tables<"Vehicles">[]>("/api/vehicles/filter", {
    method: "post",
    body: {
      filters,
    },
    key: () => `vehicles-${JSON.stringify(filters)}`,
    default: () => [],
    watch: [() => filters],
  });
}

export const useVehicle = (id?: MaybeRef<Tables<"Vehicles">["id"]>) => {
  return useAsyncData(
    () => `vehicle-${unref(id)}`,
    (_nuxtApp, { signal }) =>
      $fetch<
        Tables<"Vehicles"> & {
          shares: (Tables<"VehicleShares"> & { profile: Tables<"Profiles"> })[];
        }
      >(`/api/vehicles/${unref(id)}`, {
        credentials: "include",
        headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
        signal,
      }),
  );
};

export async function createVehicle(patch: Partial<TablesInsert<"Vehicles">>) {
  const vehicle = await $fetch<Tables<"Vehicles">>(`/api/vehicles`, {
    method: "post",
    body: patch,
    headers: useRequestHeaders(["cookie"]),
  });
  refreshNuxtData("vehicles");

  return vehicle;
}

export async function updateVehicle(
  id: MaybeRef<Tables<"Vehicles">["id"]>,
  patch: Partial<TablesUpdate<"Vehicles">>,
) {
  const vehicle = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${unref(id)}`,
    {
      method: "put",
      body: patch,
      headers: useRequestHeaders(["cookie"]),
    },
  );
  refreshNuxtData("vehicles");
  refreshNuxtData(`vehicle-${unref(id)}`);

  return vehicle;
}

export async function deleteVehicle(id: string | number) {
  const vehicle = await $fetch<Tables<"Vehicles">>(`/api/vehicles/${id}`, {
    method: "delete",
    headers: useRequestHeaders(["cookie"]),
  });
  refreshNuxtData("vehicles");
  clearNuxtData(`vehicle-${id}`);

  return vehicle;
}

export async function shareVehicle(
  id: string | number,
  patch:
    | Partial<TablesInsert<"VehicleShares">>
    | Partial<TablesInsert<"VehicleShares">>[],
) {
  const vehicleShare = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${id}/shares`,
    {
      method: "post",
      body: patch,
      headers: useRequestHeaders(["cookie"]),
    },
  );
  refreshNuxtData(`vehicle-${id}`);

  return vehicleShare;
}

export async function updateVehicleShare(
  vehicleId: MaybeRef<Tables<"VehicleShares">["vehicle_id"] | undefined>,
  shareId: MaybeRef<Tables<"VehicleShares">["id"] | undefined>,
  patch: Partial<TablesUpdate<"VehicleShares">>,
) {
  const vehicleShare = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${unref(vehicleId)}/shares/${unref(shareId)}`,
    {
      method: "put",
      body: patch,
      headers: useRequestHeaders(["cookie"]),
    },
  );
  refreshNuxtData(`vehicle-${unref(vehicleId)}`);

  return vehicleShare;
}

export async function deleteVehicleShare(
  vehicleId?: MaybeRef<Tables<"VehicleShares">["vehicle_id"] | undefined>,
  shareId?: MaybeRef<Tables<"VehicleShares">["id"] | undefined>,
) {
  const vehicleShare = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${unref(vehicleId)}/shares/${unref(shareId)}`,
    {
      method: "delete",
      headers: useRequestHeaders(["cookie"]),
    },
  );
  refreshNuxtData(`vehicle-${unref(vehicleId)}`);

  return vehicleShare;
}
