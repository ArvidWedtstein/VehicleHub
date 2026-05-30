import type { Tables } from "~/types/supabase";

export const useVehicleManufacturers = () => {
  return useFetch<Tables<"VehicleManufacturers">[]>(
    "/api/vehicleManufacturers",
    {
      key: cacheKeys.manufacturers(),
      lazy: true,
      immediate: false,
      default: () => [] as Tables<"VehicleManufacturers">[],
    },
  );
};

export const useVehicleManufacturerModels = (manufacturer?: string) => {
  return useFetch<string[]>(
    `/api/vehicleManufacturers/${manufacturer}/models`,
    {
      method: "get",
      key: cacheKeys.manufacturerModels(manufacturer || ""),
      default: () => [] as string[],
      immediate: false,
      lazy: true,
    },
  );
};
