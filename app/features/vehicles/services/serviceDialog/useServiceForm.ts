import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";
import {
  createVehicleService,
  updateVehicleService,
  useVehicleService,
} from "../useVehicleServices";
import { uploadVehicleDocument } from "../../documents/useVehicleDocuments";
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
  items: [],
});

export const useServiceForm = () => {
  const service = ref<ServiceInsert | ServiceUpdate>(getDefaultServiceValues());

  const serviceFiles = ref<File[]>([]);

  const serviceItems = ref<
    | TablesInsert<"VehicleServiceLogsItems">[]
    | TablesUpdate<"VehicleServiceLogsItems">[]
  >([]);

  const vehicle = ref<Partial<Tables<"Vehicles">>>();

  const initialize = async (
    vehicleId: Tables<"VehicleServiceLogs">["vehicle_id"],
    serviceId?: TablesUpdate<"VehicleServiceLogs">["id"]
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
              {}
            )
        ) || [];

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
          serviceItems.value
        );
      } else {
        const createdService = await createVehicleService(
          service.value.vehicle_id!,
          {
            ...service.value,
            date: convertLocalToUTC(service.value.date),
          },
          serviceItems.value
        );
        serviceId = createdService.id;
      }

      if (serviceId) {
        // TODO: find a better way to do this
        const unUploadedFiles = serviceFiles.value.filter((p) => p.type != "");

        unUploadedFiles.forEach(async (file) => {
          await uploadVehicleDocument(
            service.value.vehicle_id!,
            file,
            serviceId
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
