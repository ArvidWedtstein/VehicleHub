import type { Tables, TablesUpdate } from "~/types/supabase";

type Row = Tables<"VehicleDocuments">;

export function useVehicleDocuments(
  vehicleId: MaybeRefOrGetter<Row["vehicle_id"]>,
  filters: MaybeRefOrGetter<FilterOption<Row>[]> = [],
) {
  const resolvedVehicleId = computed(() => toValue(vehicleId));
  const resolvedFilters = computed(() => toValue(filters));

  const key = computed(() =>
    cacheKeys.documentsFiltered(resolvedVehicleId.value, resolvedFilters.value),
  );

  return useLazyFetch<Tables<"VehicleDocuments">[]>(
    `/api/vehicles/${resolvedVehicleId.value}/documents/filter`,
    {
      key: () => key.value,
      method: "post",
      body: {
        filters: resolvedFilters.value,
      },
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

  const document = await $fetch(`/api/vehicles/${vehicleId}/documents/upload`, {
    method: "POST",
    query: {
      serviceId,
    },
    body: formData,
  });

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
