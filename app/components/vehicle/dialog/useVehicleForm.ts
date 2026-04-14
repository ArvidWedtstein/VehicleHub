import type { TablesUpdate } from "~/types/supabase";
import {
  createVehicle,
  updateVehicle,
  useVehicle,
} from "~/features/vehicles/useVehicles";
import * as z from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const vehicleSchema = z.object({
  id: z.number().optional(),
  licenseplate_number: z.string().optional(),
  vehicle_identification_number: z.string().optional(),
  type: z.string().min(1).default("Car"),
  body_type: z.string().optional().default(""),
  make: z.string().optional().default(""),
  model: z.string().optional().default(""),
  model_year: z
    .number()
    .min(1885)
    .max(new Date().getFullYear() + 10)
    .optional()
    .default(new Date().getFullYear()),
  color: z.string().optional(),
  engine_displacement: z.number().optional(),
  engine_displacement_unit: z.string().optional(),
  drivetrain: z.string().toUpperCase().default("FWD"),
  engine_cylinders: z.number().min(1).max(100).optional(),
  weight: z.number().optional(),
  transmission_gears: z.number().optional(),
  transmission_type: z.string().optional().default("automatic"),
  fuel_type: z.string().optional().default("Gasoline"),
  fuel_capacity: z.number().optional().default(0),
  fuel_capacity_unit: z.string().optional().default("liter"),
  mileage_unit: z.string().optional().default("kilometer"),
  thumbnail: z
    .instanceof(File, {
      message: "Please select an image file.",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `The image is too large. Please choose an image smaller than 2 MB.`,
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Please upload a valid image file (JPEG, PNG, or WebP).",
    })
    .refine(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const meetsDimensions =
                img.width >= MIN_DIMENSIONS.width &&
                img.height >= MIN_DIMENSIONS.height &&
                img.width <= MAX_DIMENSIONS.width &&
                img.height <= MAX_DIMENSIONS.height;
              resolve(meetsDimensions);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }),
      {
        message: `The image dimensions are invalid. Please upload an image between ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} and ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`,
      },
    )
    .optional(),
});

export type VehicleSchema = z.output<typeof vehicleSchema>;

export const useVehicleForm = () => {
  const vehicle = ref<Partial<VehicleSchema>>(
    vehicleSchema.parse({
      thumbnail: undefined,
    }),
  );

  const initialize = async (vehicle_id?: TablesUpdate<"Vehicles">["id"]) => {
    if (vehicle_id == null) {
      vehicle.value = vehicleSchema.parse({ thumnail: undefined });
      return;
    }

    const { data: editVehicle } = await useVehicle(vehicle_id);
    if (!editVehicle.value) {
      return;
    }

    vehicle.value = vehicleSchema.parse({
      ...omit(editVehicle.value, ["shares"]),
      thumbnail: undefined,
    });
  };

  const isEdit = computed(() => !!vehicle.value.id);

  const save = async () => {
    try {
      let vehicleId = vehicle.value.id;

      if (isEdit.value && vehicle.value.id) {
        await updateVehicle(
          vehicle.value.id,
          omit(vehicle.value, ["thumbnail"]),
        );
      } else {
        const createdVehicle = await createVehicle(
          omit(vehicle.value, ["thumbnail"]),
        );
        vehicleId = createdVehicle.id;
      }

      if (vehicle.value.thumbnail && vehicleId) {
        const formData = new FormData();
        formData.append("file", vehicle.value.thumbnail);

        const data = await $fetch(`/api/vehicles/${vehicleId}/images/upload`, {
          method: "POST",
          body: formData,
        });
        if (!data) return;

        await updateVehicle(vehicleId, {
          ...vehicle.value,
          thumbnail: data.fullPath,
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    vehicleSchema,
    vehicle,
    isEdit,
    save,
    initialize,
  };
};
