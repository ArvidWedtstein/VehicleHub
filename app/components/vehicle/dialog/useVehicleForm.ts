import type { TablesUpdate } from "~/types/supabase";
import z from "zod";
import { dbToForm } from "#shared/schemas/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const FUELTYPE_OPTIONS = [
  "Gasoline",
  "Diesel",
  "Kerosene",
  "Gas",
  "Electric",
  "Hybrid",
  "Hydrogen",
  "Other",
  "Biodiesel",
  "Biogasoline",
  "LPG-gas",
  "CNG-gas",
  "Metanol",
  "Etanol",
  "LPG-A",
  "LPG-B",
  "CNG 20",
  "CNG 25",
];

export const DRIVETRAIN_OPTIONS: ("FWD" | "RWD" | "AWD" | "4WD")[] = [
  "FWD",
  "RWD",
  "AWD",
  "4WD",
];

const vehicleSchema = z.object({
  id: z.number().optional(),
  licenseplate_number: dbToForm(z.string()),
  vehicle_identification_number: dbToForm(z.string()),
  type: z.string().min(1).nonoptional().default("Car"),
  body_type: dbToForm(z.string().default("")),
  make: dbToForm(z.string()).default(""),
  model: dbToForm(z.string()).default(""),
  model_year: dbToForm(
    z
      .number()
      .min(1885)
      .max(new Date().getFullYear() + 10)
      .default(new Date().getFullYear()),
  ),
  color: dbToForm(z.string()),
  engine_displacement: dbToForm(z.number()),
  engine_displacement_unit: dbToForm(z.string()),
  drivetrain: dbToForm(z.enum(DRIVETRAIN_OPTIONS)).default("FWD"),
  engine_cylinders: dbToForm(z.number().min(0).max(100)),
  weight: dbToForm(z.number().min(0)),
  transmission_gears: dbToForm(z.number().min(0).max(100)),
  transmission_type: dbToForm(z.string()).default("Automatic"),
  fuel_type: dbToForm(z.enum(FUELTYPE_OPTIONS)).default("Gasoline"),
  fuel_capacity: dbToForm(z.number()).default(0),
  fuel_capacity_unit: dbToForm(z.string()).default("liter"),
  mileage_unit: dbToForm(z.string()).default("kilometer"),
  owner_user_id: dbToForm(z.uuid()).default(
    () => useSupabaseUser().value?.id ?? "",
  ),
  thumbnail: dbToForm(z.string()),
  thumbnailFile: z
    .file()
    .max(MAX_FILE_SIZE)
    .mime(ACCEPTED_IMAGE_TYPES)
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
      thumbnailFile: undefined,
    }),
  );

  const resolveThumbnailUrl = (fullPath?: string) => {
    if (!fullPath) return undefined;
    // Supabase `fullPath` is "<bucket>/<path>"
    const [bucket, ...rest] = fullPath.split("/");
    return useSupabaseClient()
      .storage.from(bucket!)
      .getPublicUrl(rest.join("/")).data.publicUrl;
  };

  const thumbnailUrl = ref<string>();
  const thumbnailModel = computed<File | FileUploadItem | null>({
    get: () => {
      if (vehicle.value.thumbnailFile) return vehicle.value.thumbnailFile;
      if (thumbnailUrl.value) {
        return {
          name: vehicle.value.thumbnail?.split("/").pop() ?? "thumbnail",
          type: "image/*",
          avatar: { src: thumbnailUrl.value, alt: "Thumbnail" },
        };
      }
      return null;
    },
    set: (val) => {
      if (val instanceof File) {
        vehicle.value.thumbnailFile = val;
      } else if (!val) {
        vehicle.value.thumbnailFile = undefined;
        vehicle.value.thumbnail = undefined;
        thumbnailUrl.value = undefined;
      }
    },
  });

  const initialize = async (vehicle_id?: TablesUpdate<"Vehicles">["id"]) => {
    if (vehicle_id == null) {
      thumbnailUrl.value = undefined;

      vehicle.value = vehicleSchema.parse({ thumbnailFile: undefined });
      return;
    }

    const { data: editVehicle } = await useVehicle(vehicle_id);
    if (!editVehicle.value) {
      return;
    }

    console.log("edit", editVehicle.value);

    vehicle.value = vehicleSchema.parse({
      ...omit(editVehicle.value, ["shares"]),
      thumbnailFile: undefined,
    });

    thumbnailUrl.value = resolveThumbnailUrl(vehicle.value.thumbnail);
  };

  const isEdit = computed(() => !!vehicle.value.id);

  const save = async () => {
    try {
      let vehicleId = vehicle.value.id;

      if (isEdit.value && vehicle.value.id) {
        await updateVehicle(
          vehicle.value.id,
          omit(vehicle.value, ["thumbnailFile", "thumbnail"]),
        );
      } else {
        const createdVehicle = await createVehicle(
          omit(vehicle.value, ["thumbnailFile", "thumbnail"]),
        );
        vehicleId = createdVehicle.id;
      }

      if (vehicle.value.thumbnailFile && vehicleId) {
        const formData = new FormData();
        formData.append("file", vehicle.value.thumbnailFile);

        const data = await $fetch(`/api/vehicles/${vehicleId}/images/upload`, {
          method: "POST",
          body: formData,
        });
        if (!data) return;

        await updateVehicle(vehicleId, {
          ...omit(vehicle.value, ["thumbnailFile"]),
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
    thumbnailModel,
    isEdit,
    save,
    initialize,
  };
};
