import type { Tables } from "~/types/supabase";
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

  const toast = useToast();

  const initialize = async (vehicle_id: Tables<"Vehicles">["id"]) => {
    const { data: vehicle } = await useVehicle(vehicle_id);

    initialVehicleShares.value = [...(vehicle.value?.shares || [])];
    vehicleShares.value = vehicleShareSchema.parse(vehicle.value?.shares || []);
  };

  const save = async () => {
    try {
      const vehicleId = initialVehicleShares.value[0]?.vehicle_id;
      if (!vehicleId) return;

      const deletedShares = initialVehicleShares.value.filter(
        (share) => !vehicleShares.value.some((s) => s.id === share.id),
      );

      // Upsert shares
      if (vehicleShares.value.length > 0) {
        await upsertVehicleShares(vehicleId, vehicleShares.value);
      }

      // Delete shares
      if (deletedShares.length > 0) {
        await deleteVehicleShares(
          vehicleId,
          deletedShares.map((share) => share.id),
        );
      }

      toast.add({
        title: "Vehicle shares saved successfully!",
        color: "success",
      });
    } catch (err) {
      console.error(err);
      toast.add({ title: "Error saving vehicle shares!", color: "error" });
    }
  };

  return {
    vehicleShareSchema,
    vehicleShares,
    initialize,
    save,
  };
};
