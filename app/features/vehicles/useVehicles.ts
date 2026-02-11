import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicles(filters: FilterOption<Tables<"Vehicles">>[] = []) {
  return useAsyncData("vehicles", async () => {
    return await $fetch<Tables<"Vehicles">[]>("/api/vehicles/filter", {
      method: "post",
      body: {
        filters,
      },
      headers: useRequestHeaders(["cookie"]),
    });
  });
}

export const useVehicle = (id?: string | number) => {
  return useAsyncData(`vehicle-${id}`, (_nuxtApp, { signal }) =>
    $fetch<
      Tables<"Vehicles"> & {
        shares: (Tables<"VehicleShares"> & { profile: Tables<"Profiles"> })[];
      }
    >(`/api/vehicles/${id}`, {
      credentials: "include",
      headers: useRequestHeaders(["cookie"]),
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
  id: string | number,
  patch: Partial<TablesUpdate<"Vehicles">>,
) {
  const vehicle = await $fetch<Tables<"Vehicles">>(`/api/vehicles/${id}`, {
    method: "put",
    body: patch,
    headers: useRequestHeaders(["cookie"]),
  });
  refreshNuxtData("vehicles");
  refreshNuxtData(`vehicle-${id}`);

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
