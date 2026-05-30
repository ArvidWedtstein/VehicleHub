export const cacheKeys = {
  vehicles: () => `vehicles`,
  vehicle: (vehicleId: number) => `vehicle-${vehicleId}`,
  services: (vehicleId: number) => `vehicle-${vehicleId}_services`,
  service: (vehicleId: number, id: number) =>
    `vehicle-${vehicleId}_service-${id}`,
  expenses: (vehicleId: number) => `vehicle-${vehicleId}_expenses`,
  expense: (vehicleId: number, id: number) =>
    `vehicle-${vehicleId}_expense-${id}`,
  documents: (vehicleId: number) => `vehicle-${vehicleId}_documents`,
  document: (vehicleId: number, id: number) =>
    `vehicle-${vehicleId}_document-${id}`,
} as const;

export function patchNuxtDataItem<T extends { id: number }>(
  key: string,
  updated: Partial<T>,
) {
  const cache = useNuxtData<T>(key);
  if (cache.data.value) {
    cache.data.value = { ...cache.data.value, ...updated };
  }
}

export function patchNuxtDataList<T extends { id: number }>(
  key: string,
  id: number,
  updated: Partial<T>,
) {
  const cache = useNuxtData<T[]>(key);
  if (cache.data.value) {
    cache.data.value = cache.data.value.map((item) =>
      item.id === id ? { ...item, ...updated } : item,
    );
  }
}

export function removeFromNuxtDataList<T extends { id: number }>(
  key: string,
  id: number,
) {
  const cache = useNuxtData<T[]>(key);
  if (cache.data.value) {
    cache.data.value = cache.data.value.filter((item) => item.id !== id);
  }
}
