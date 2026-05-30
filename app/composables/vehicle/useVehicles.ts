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
    key: cacheKeys.vehicles(),
    default: () => [],
  });
}

export const useVehicle = (id: MaybeRefOrGetter<Tables<"Vehicles">["id"]>) => {
  const vehicleId = computed(() => toValue(id));

  return useFetch<
    Tables<"Vehicles"> & {
      shares: (Tables<"VehicleShares"> & { profile: Tables<"Profiles"> })[];
    }
  >(() => `/api/vehicles/${vehicleId.value}`, {
    key: () => cacheKeys.vehicle(vehicleId.value),
    lazy: true,
    immediate: !!vehicleId.value,
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
  id: MaybeRefOrGetter<Tables<"Vehicles">["id"]>,
  patch: Partial<TablesUpdate<"Vehicles">>,
) {
  const resolvedId = toValue(id);

  const updated = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${resolvedId}`,
    {
      method: "put",
      body: {
        vehicle: patch,
      },
    },
  );

  patchNuxtDataList(cacheKeys.vehicles(), resolvedId, updated);
  patchNuxtDataItem(cacheKeys.vehicle(resolvedId), updated);

  return updated;
}

export async function deleteVehicle(
  id: MaybeRefOrGetter<Tables<"Vehicles">["id"]>,
) {
  await $fetch<Tables<"Vehicles">>(`/api/vehicles/${toValue(id)}`, {
    method: "delete",
  });

  removeFromNuxtDataList(cacheKeys.vehicles(), toValue(id));
  clearNuxtData(cacheKeys.vehicle(toValue(id)));
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
  refreshNuxtData(cacheKeys.vehicle(vehicleId));

  return vehicleShare;
}

export async function deleteVehicleShares(
  vehicleId: MaybeRefOrGetter<Tables<"VehicleShares">["vehicle_id"]>,
  shareIds: Tables<"VehicleShares">["id"][] = [],
) {
  const vehicleShare = await $fetch<Tables<"Vehicles">>(
    `/api/vehicles/${toValue(vehicleId)}/shares`,
    {
      body: {
        ids: shareIds,
      },
      method: "delete",
    },
  );
  refreshNuxtData(cacheKeys.vehicle(toValue(vehicleId)));

  return vehicleShare;
}
