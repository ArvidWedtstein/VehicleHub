import type { Tables, TablesUpdate } from "~/types/supabase";

export function useVehicleDocuments(vehicleId?: string | number) {
  return useFetch<Tables<"VehicleDocuments">[]>(
    `/api/vehicles/${vehicleId}/documents`,
    {
      key: `vehicle-${vehicleId}_documents`,
      immediate: !!vehicleId,
    },
  );
}

export async function uploadVehicleDocument(
  vehicleId: string | number,
  file: File | File[],
  serviceId?: Tables<"VehicleServiceLogs">["id"],
) {
  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach((f) => formData.append("file", f));
  } else {
    formData.append("file", file);
  }

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
    },
  );

  refreshNuxtData(`vehicle-${vehicleId}_documents`);

  return document;
}

/** TODO: fix or remove*/
export const updateVehicleDocument = async (
  vehicleId: string | number,
  id: string | number,
  patch: Partial<TablesUpdate<"VehicleDocuments">>,
) => {
  const document = await $fetch<Tables<"VehicleDocuments">>(
    `/api/vehicles/${vehicleId}/documents/${id}`,
    {
      method: "put",
      body: patch,
    },
  );
  refreshNuxtData(`vehicle-${vehicleId}_documents`);
  refreshNuxtData(`vehicle-${vehicleId}_document-${id}`);

  return document;
};

export const deleteVehicleDocument = async (
  vehicleId: string | number,
  documentId: string | number,
  filePath: string,
) => {
  const document = await $fetch<Tables<"VehicleDocuments">>(
    `/api/vehicles/${vehicleId}/documents/${documentId}`,
    {
      method: "delete",
      body: {
        filePath,
      },
    },
  );

  clearNuxtData(`vehicle-${vehicleId}_document-${documentId}`);
  refreshNuxtData(`vehicle-${vehicleId}_documents`);

  return document;
};
