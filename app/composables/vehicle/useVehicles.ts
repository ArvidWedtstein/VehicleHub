import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicles(
  filters: MaybeRef<FilterOption<Tables<"Vehicles">>[]> = [],
) {
  const resolvedFilters = computed(() => unref(filters));

  return useFetch<Tables<"Vehicles">[]>("/api/vehicles/filter", {
    method: "post",
    body: computed(() => ({
      filters: resolvedFilters.value,
    })),
    key: `vehicles`,
    default: () => [],
  });
}

export const useVehicle = (
  id?: MaybeRef<Tables<"Vehicles">["id"] | undefined>,
) => {
  const vehicleId = computed(() => unref(id));

  return useFetch<
    Tables<"Vehicles"> & {
      shares: (Tables<"VehicleShares"> & { profile: Tables<"Profiles"> })[];
    }
  >(() => `/api/vehicles/${vehicleId.value}`, {
    key: `vehicle-${vehicleId.value}`,
    immediate: !!vehicleId.value,
    watch: [vehicleId],
  });
};

export async function createVehicle(patch: Partial<TablesInsert<"Vehicles">>) {
  const vehicle = await $fetch<Tables<"Vehicles">>(`/api/vehicles`, {
    method: "post",
    body: {
      vehicle: patch,
    },
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
      body: {
        vehicle: patch,
      },
    },
  );
  refreshNuxtData("vehicles");
  refreshNuxtData(`vehicle-${unref(id)}`);

  return vehicle;
}

export async function deleteVehicle(id: string | number) {
  const vehicle = await $fetch<Tables<"Vehicles">>(`/api/vehicles/${id}`, {
    method: "delete",
  });
  refreshNuxtData("vehicles");
  clearNuxtData(`vehicle-${id}`);

  return vehicle;
}

export async function upsertVehicleShares(
  vehicleId: Tables<"Vehicles">["id"],
  patch: (
    | Partial<TablesInsert<"VehicleShares">>
    | Partial<TablesInsert<"VehicleShares">>
  )[],
) {
  const vehicleShare = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${vehicleId}/shares`,
    {
      method: "post",
      body: {
        shares: Array.isArray(patch) ? patch : [patch],
      },
    },
  );
  refreshNuxtData(`vehicle-${vehicleId}`);

  return vehicleShare;
}

export async function deleteVehicleShares(
  vehicleId?: MaybeRef<Tables<"VehicleShares">["vehicle_id"] | undefined>,
  shareIds: Tables<"VehicleShares">["id"][] = [],
) {
  const vehicleShare = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${unref(vehicleId)}/shares`,
    {
      body: {
        ids: shareIds,
      },
      method: "delete",
    },
  );
  refreshNuxtData(`vehicle-${unref(vehicleId)}`);

  return vehicleShare;
}
