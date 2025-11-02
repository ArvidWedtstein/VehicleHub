import type { Tables, TablesInsert } from "~/types/supabase";
import {
  deleteVehicleShare,
  shareVehicle,
  updateVehicleShare,
  useVehicle,
} from "../useVehicles";

type VehicleShareWithProfile = Tables<"VehicleShares"> & {
  profile: Pick<Tables<"Profiles">, "id" | "profile_image_url" | "name">;
};

export const useShareVehicleForm = () => {
  const initialVehicleShares = ref<VehicleShareWithProfile[]>([]);
  const vehicleShares = ref<VehicleShareWithProfile[]>([]);

  const initialize = async (vehicle_id: Tables<"Vehicles">["id"]) => {
    const { data: vehicle } = await useVehicle(vehicle_id);

    initialVehicleShares.value = [...(vehicle.value?.shares || [])];
    vehicleShares.value = [...(vehicle.value?.shares || [])];
  };

  const save = async () => {
    try {
      // TODO: fix
      const vehicleId = initialVehicleShares.value[0]?.vehicle_id;
      if (!vehicleId) return;

      const deletedShares = initialVehicleShares.value.filter(
        (share) => !vehicleShares.value.some((s) => s.id === share.id)
      );
      const newShares = vehicleShares.value.filter(
        (share) => !initialVehicleShares.value.some((s) => s.id === share.id)
      );
      const updatedShares = vehicleShares.value
        .filter((share) =>
          initialVehicleShares.value.some((s) => s.id === share.id)
        )
        .map(({ profile, ...share }) => ({
          ...share,
          user_id: share.user_id ?? profile.id,
        }));

      // Delete shares
      if (deletedShares.length > 0) {
        const deletePromises = deletedShares.map((share) => {
          return deleteVehicleShare(vehicleId, share.id);
        });

        await Promise.all(deletePromises);
      }

      // Add shares
      if (newShares.length > 0) {
        await shareVehicle(vehicleId, newShares);
      }

      // Update shares
      if (updatedShares.length > 0) {
        const updatePromises = updatedShares.map((share) => {
          return updateVehicleShare(vehicleId, share.id, share);
        });

        await Promise.all(updatePromises);
      }

      toast.success("Vehicle shares saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving vehicle shares!");
    }
  };

  return {
    vehicleShares,
    initialVehicleShares,
    initialize,
    save,
  };
};
