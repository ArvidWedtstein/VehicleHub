import type { Tables } from "~/types/supabase";

export const useVehicleManufacturers = () => {
  return useFetch<Tables<"VehicleManufacturers">[]>(
    "/api/vehicleManufacturers",
    {
      key: "vehicleManufacturers",
    },
  );
};
