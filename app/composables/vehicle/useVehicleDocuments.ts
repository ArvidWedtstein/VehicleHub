import type { Tables, TablesUpdate } from "~/types/supabase";

export function useVehicleDocuments(
  vehicleId: MaybeRefOrGetter<Tables<"Vehicles">["id"]>,
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));

  return useLazyFetch<Tables<"VehicleDocuments">[]>(
    `/api/vehicles/${resolvedVehicleId.value}/documents`,
    {
      key: cacheKeys.documents(resolvedVehicleId.value),
      immediate: !!resolvedVehicleId.value,
    },
  );
}

export async function uploadVehicleDocument(
  vehicleId: Tables<"Vehicles">["id"],
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

  refreshNuxtData(cacheKeys.documents(vehicleId));

  return document;
}

/** TODO: fix or remove*/
export const updateVehicleDocument = async (
  vehicleId: Tables<"Vehicles">["id"],
  id: Tables<"VehicleDocuments">["id"],
  patch: Partial<TablesUpdate<"VehicleDocuments">>,
) => {
  const document = await $fetch<Tables<"VehicleDocuments">>(
    `/api/vehicles/${vehicleId}/documents/${id}`,
    {
      method: "put",
      body: patch,
    },
  );
  refreshNuxtData(cacheKeys.documents(vehicleId));
  refreshNuxtData(cacheKeys.document(vehicleId, id));

  return document;
};

export const deleteVehicleDocument = async (
  vehicleId: Tables<"Vehicles">["id"],
  documentId: Tables<"VehicleDocuments">["id"],
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

  clearNuxtData(cacheKeys.document(vehicleId, documentId));
  refreshNuxtData(cacheKeys.documents(vehicleId));

  return document;
};
