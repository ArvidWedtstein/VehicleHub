import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";
import {
  createVehicleService,
  updateVehicleService,
  useVehicleService,
} from "../useVehicleServices";
import {
  uploadVehicleDocument,
  deleteVehicleDocument,
} from "../../documents/useVehicleDocuments";
import { useVehicle } from "../../useVehicles";

type ServiceInsert = TablesInsert<"VehicleServiceLogs"> & {
  items?: TablesInsert<"VehicleServiceLogsItems">[];
  files?: Tables<"VehicleDocuments">[];
};
type ServiceUpdate = TablesUpdate<"VehicleServiceLogs"> & {
  items?: TablesUpdate<"VehicleServiceLogsItems">[];
  files?: Tables<"VehicleDocuments">[];
};

const getDefaultServiceValues = (): ServiceUpdate => ({
  date: new Date().toUTCString().split(".")[0]?.slice(0, -3),
  provider: "",
  cost: 0,
  currency: "NOK",
  mileage: 0,
  notes: "",
  type: "",
});

export const useServiceForm = () => {
  const service = ref<ServiceInsert | ServiceUpdate>(getDefaultServiceValues());

  const originalServiceFiles = shallowRef<Tables<"VehicleDocuments">[]>([]);
  const serviceFiles = ref<File[]>([]);

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

    if (serviceId) {
      const { data: editService } = useVehicleService(vehicleId, serviceId);

      service.value = {
        ...editService.value,
        date: convertToDatetimeLocal(editService.value?.date),
      };

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
      serviceItems.value = editService.value?.items || [];

      return;
    }

    const client = useSupabaseClient();
    const { data, error } = await client.rpc("get_last_mileage", {
      vehicle_id: vehicleId,
      type: "services",
    });

    if (error) throw error;

    const lastMileage = data[0]?.mileage;

    service.value = {
      vehicle_id: vehicleId,
      ...getDefaultServiceValues(),
      date: convertToDatetimeLocal(),
      mileage: lastMileage,
    };

    serviceItems.value = [];
    serviceFiles.value = [];
    originalServiceFiles.value = [];
  };

  const isEdit = computed(() => !!service.value.id);

  const save = async () => {
    if (!service.value.vehicle_id) {
      throw new Error("Vehicle ID is required");
    }

    try {
      let serviceId = service.value.id;

      if (isEdit.value && service.value.id) {
        await updateVehicleService(
          service.value.vehicle_id!,
          service.value.id,
          {
            ...service.value,
            date: convertLocalToUTC(service.value.date),
          },
          serviceItems.value,
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
    save,
    initialize,
  };
};
