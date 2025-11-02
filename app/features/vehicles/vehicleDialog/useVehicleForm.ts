import type { TablesInsert, TablesUpdate } from "~/types/supabase";
import { createVehicle, updateVehicle, useVehicle } from "../useVehicles";

const getDefaultVehicleValues = () => ({
  make: undefined,
  model: undefined,
  model_year: undefined,
  type: "Car",
  body_type: "",
  color: "",
  engine_displacement: undefined,
  engine_displacement_unit: "liter",
  engine_cylinders: undefined,
  drivetrain: "FWD",
  licenseplate_number: "",
  vehicle_identification_number: "",
  weight: 0,
  transmission_gears: undefined,
  fuel_type: undefined,
  fuel_capacity: 0,
  fuel_capacity_unit: "liter",
  mileage_unit: "kilometer",
  transmission_type: "automatic",
});

export const useVehicleForm = () => {
  const vehicle = ref<TablesInsert<"Vehicles"> | TablesUpdate<"Vehicles">>(
    getDefaultVehicleValues()
  );

  const initialVehicleState = ref<
    TablesInsert<"Vehicles"> | TablesUpdate<"Vehicles">
  >(getDefaultVehicleValues());

  const initialize = async (vehicle_id?: TablesUpdate<"Vehicles">["id"]) => {
    if (vehicle_id == null) {
      vehicle.value = getDefaultVehicleValues();
      initialVehicleState.value = getDefaultVehicleValues();
      return;
    }

    const { data: editVehicle } = await useVehicle(vehicle_id);

    if (!editVehicle.value) {
      return;
    }

    vehicle.value = {
      ...getDefaultVehicleValues(),
      ...editVehicle.value,
    };
    initialVehicleState.value = { ...vehicle.value };
  };

  const isEdit = computed(() => !!vehicle.value.id);

  const hasUnsavedChanges = computed(() => {
    return (
      JSON.stringify(vehicle.value) !==
      JSON.stringify(initialVehicleState.value)
    );
  });

  const save = async (files: File[] = []) => {
    try {
      let vehicleId = vehicle.value.id;

      if (isEdit.value && vehicle.value.id) {
        await updateVehicle(vehicle.value.id, vehicle.value);
      } else {
        const createdVehicle = await createVehicle(vehicle.value);
        vehicleId = createdVehicle.id;
      }

      const documentFile = files[0];
      if (documentFile && vehicleId) {
        const formData = new FormData();
        formData.append("file", documentFile);

        const data = await $fetch(`/api/vehicles/${vehicleId}/images/upload`, {
          method: "POST",
          body: formData,
        });

        if (!data) return;

        vehicle.value.thumbnail = data.fullPath;

        await updateVehicle(vehicleId, vehicle.value);
      }

      initialVehicleState.value = { ...vehicle.value };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    vehicle,
    isEdit,
    save,
    initialize,
    hasUnsavedChanges,
  };
};
