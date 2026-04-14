import type { Tables, TablesInsert } from "~/types/supabase";
import {
  deleteVehicleShare,
  shareVehicle,
  updateVehicleShare,
  useVehicle,
} from "../../../features/vehicles/useVehicles";
import * as z from "zod";

type VehicleShareWithProfile = Tables<"VehicleShares"> & {
  profile: Pick<Tables<"Profiles">, "id" | "profile_image_url" | "name">;
};

const vehicleShareSchema = z.array(
  z.object({
    id: z.number().optional(),
    readonly: z.boolean().optional().default(false),
    user_id: z.string(),
    vehicle_id: z.number(),
    profile: z
      .object({
        name: z.string(),
        profile_image_url: z.string(),
      })
      .optional(),
  }),
);

export type VehicleSchareSchema = z.output<typeof vehicleShareSchema>;

export const useShareVehicleForm = () => {
  const initialVehicleShares = ref<VehicleShareWithProfile[]>([]);
  const vehicleShares = ref<VehicleSchareSchema>([]);

  const initialize = async (vehicle_id: Tables<"Vehicles">["id"]) => {
    const { data: vehicle } = await useVehicle(vehicle_id);

    initialVehicleShares.value = [...(vehicle.value?.shares || [])];
    vehicleShares.value = vehicleShareSchema.parse(vehicle.value?.shares || []);
  };

  const save = async () => {
    try {
      // TODO: fix. Implement one api call for syncing shares
      const vehicleId = initialVehicleShares.value[0]?.vehicle_id;
      if (!vehicleId) return;

      const deletedShares = initialVehicleShares.value.filter(
        (share) => !vehicleShares.value.some((s) => s.id === share.id),
      );
      const newShares = vehicleShares.value.filter(
        (share) => !initialVehicleShares.value.some((s) => s.id === share.id),
      );
      const updatedShares = vehicleShares.value
        .filter((share) =>
          initialVehicleShares.value.some((s) => s.id === share.id),
        )
        .map(({ ...share }) => ({
          ...share,
          user_id: share.user_id,
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
    vehicleShareSchema,
    vehicleShares,
    initialize,
    save,
  };
};
