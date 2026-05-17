import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

import z from "zod";
import {
  deleteVehicleDocument,
  uploadVehicleDocument,
} from "~/composables/vehicle/useVehicleDocuments";
import { nullish } from "#shared/schemas/utils";

const serviceItemSchema = z.object({
  id: z.number().positive().optional(),
  service_log_id: z.number().positive().optional(),
  description: z.string().optional(),
  quantity: z
    .number({ error: "Quantity is required" })
    .min(0, "Amount cannot be less than 0")
    .default(1),
  cost: z.number({ error: "Cost is required" }).positive().default(0),
});

const serviceSchema = z.object({
  id: z.number().positive().optional(),
  vehicle_id: z.number().positive().optional(),
  // date: z.iso.datetime().default(() => convertToDatetimeLocal()),
  date: z.string().default(convertToDatetimeLocal()),
  type: z.string().nonempty().default(""),
  provider: nullish(z.string()),
  mileage: nullish(z.number().positive()),
  currency: z.string().length(3).toUpperCase().default("NOK"),
  notes: nullish(z.string()),
});

export type ServiceSchema = z.output<typeof serviceSchema>;

export type ServiceItemSchema = z.output<typeof serviceItemSchema>;

export const useServiceForm = () => {
  const service = ref<ServiceSchema>(
    serviceSchema.parse({
      notes: null,
      mileage: null,
      provider: null,
    }),
  );

  const originalServiceFiles = shallowRef<Tables<"VehicleDocuments">[]>([]);
  const serviceFiles = ref<File[]>([]);

  const originalServiceItemIds = shallowRef<
    Pick<TablesUpdate<"VehicleServiceLogsItems">, "id">[]
  >([]);
  const serviceItems = ref<
    | TablesInsert<"VehicleServiceLogsItems">[]
    | TablesUpdate<"VehicleServiceLogsItems">[]
  >([]);

  const vehicle = ref<Partial<Tables<"Vehicles">>>();

  const initialize = async (
    vehicleId: Tables<"VehicleServiceLogs">["vehicle_id"],
    serviceId?: TablesUpdate<"VehicleServiceLogs">["id"],
  ) => {
    const { data: vehicleData } = await useVehicle(vehicleId);
    vehicle.value = vehicleData.value;

    // Edit mode
    if (serviceId) {
      const { data: editService } = await useVehicleService(
        vehicleId,
        serviceId,
      );
      console.log(
        "edit",
        editService.value,
        convertToDatetimeLocal(editService.value?.date),
      );

      service.value = serviceSchema.parse({
        ...editService.value,
        date: convertToDatetimeLocal(editService.value?.date),
      });

      console.log("edit", service.value);

      // TODO: remove
      const files =
        editService.value?.files.map(
          (document) =>
            new File(
              [new ArrayBuffer(document.file_size || 0)],
              document.name || "",
              {},
            ),
        ) || [];

      originalServiceFiles.value = editService.value?.files || [];
      serviceFiles.value = files;

      originalServiceItemIds.value = (editService.value?.items || []).map(
        (row) => pick(row, ["id"]),
      );
      serviceItems.value = editService.value?.items || [];

      return;
    }

    // Create mode
    const client = useSupabaseClient();
    const { data, error } = await client.rpc("get_last_mileage", {
      vehicle_id: vehicleId,
      type: "services",
    });

    if (error) throw error;

    const lastMileage = data[0]?.mileage;

    service.value = serviceSchema.parse({
      vehicle_id: vehicleId,
      mileage: lastMileage,
    });

    console.log(service.value);

    originalServiceItemIds.value = [];
    serviceItems.value = [];
    serviceFiles.value = [];
    originalServiceFiles.value = [];
  };

  const isEdit = computed(() => !!service.value.id);

  const save = async () => {
    if (!service.value.vehicle_id) {
      throw createError("Vehicle ID is required");
    }

    try {
      let serviceId = service.value.id;

      const itemsToDelete = originalServiceItemIds.value.filter(
        ({ id }) => !serviceItems.value.some((item) => item.id === id),
      );

      // Edit mode
      if (isEdit.value && serviceId) {
        await updateVehicleService(
          service.value.vehicle_id,
          serviceId,
          {
            ...service.value,
            date: convertLocalToUTC(service.value.date),
          },
          serviceItems.value,
          itemsToDelete,
        );
      } else {
        const createdService = await createVehicleService(
          service.value.vehicle_id!,
          {
            ...service.value,
            date: convertLocalToUTC(service.value.date),
          },
          serviceItems.value,
        );
        serviceId = createdService.id;
      }

      if (serviceId) {
        // TODO: find a better way to do this
        const filesToDelete = originalServiceFiles.value.filter(
          (originalFile) =>
            !serviceFiles.value.some(
              (file) =>
                file.name === originalFile.name &&
                file.size === originalFile.file_size,
            ),
        );
        for (const file of filesToDelete) {
          await deleteVehicleDocument(
            service.value.vehicle_id!,
            file.id,
            file.file_path,
          );
        }

        const unUploadedFiles = serviceFiles.value.filter(
          (file) =>
            !originalServiceFiles.value.some(
              (originalFile) =>
                file.name === originalFile.name &&
                file.size === originalFile.file_size,
            ),
        );

        unUploadedFiles.forEach(async (file) => {
          await uploadVehicleDocument(
            service.value.vehicle_id!,
            file,
            serviceId,
          );
        });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    service,
    serviceFiles,
    serviceItems,
    isEdit,
    vehicle,
    serviceSchema,
    save,
    initialize,
  };
};
