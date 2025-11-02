import type { Tables } from "~/types/supabase";

export const useVehicleManufacturers = () => {
  return useAsyncData("vehicleManufacturers", async () => {
    return await $fetch<Tables<"VehicleManufacturers">[]>(
      "/api/vehicleManufacturers"
    );
  });
};
