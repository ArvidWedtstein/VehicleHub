import type { Tables, TablesInsert, TablesUpdate } from "~/types/supabase";

export function useVehicleDocuments(vehicleId?: string | number) {
  return useAsyncData(`vehicle-${vehicleId}_documents`, async () => {
    return await $fetch<Tables<"VehicleDocuments">[]>(
      `/api/vehicles/${vehicleId}/documents`,
      {
        headers: useRequestHeaders(["cookie"]),
      }
    );
  });
}

export async function uploadVehicleDocument(
  vehicleId: string | number,
  file: File,
  serviceId?: Tables<"VehicleServiceLogs">["id"]
) {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();

  if (serviceId) {
    params.append("serviceId", serviceId.toString());
  }

  const document = await $fetch(
    `/api/vehicles/${vehicleId}/documents/upload${
      params.toString().length > 0 ? `?${params.toString()}` : ""
    }`,
    {
      method: "POST",
      body: formData,
    }
  );

  refreshNuxtData(`vehicle-${vehicleId}_documents`);

  return document;
}

/** TODO: fix or remove*/
export const updateVehicleDocument = async (
  vehicleId: string | number,
  id: string | number,
  patch: Partial<TablesUpdate<"VehicleDocuments">>
) => {
  const document = await $fetch<Tables<"VehicleDocuments">>(
    `/api/vehicles/${vehicleId}/documents/${id}`,
    {
      method: "put",
      body: patch,
    }
  );
  refreshNuxtData(`vehicle-${vehicleId}_documents`);
  refreshNuxtData(`vehicle-${vehicleId}_document-${id}`);

  return document;
};

export const deleteVehicleDocument = async (
  vehicleId: string | number,
  id: string | number
) => {
  const document = await $fetch<Tables<"VehicleDocuments">>(
    `/api/vehicles/${vehicleId}/documents/${id}`,
    {
      method: "delete",
    }
  );

  clearNuxtData(`vehicle-${vehicleId}_document-${id}`);
  refreshNuxtData(`vehicle-${vehicleId}_documents`);

  return document;
};
