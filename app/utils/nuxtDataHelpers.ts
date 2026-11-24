import { hash } from "ohash";

export const cacheKeys = {
  vehicles: () => `vehicles`,
  vehicle: (vehicleId: number) => `vehicle-${vehicleId}`,
  servicesPrefix: (vehicleId: number) => `vehicle-${vehicleId}_services?`,
  servicesFiltered: (vehicleId: number, filters: unknown) =>
    `vehicle-${vehicleId}_services?${hash(filters ?? [])}`,
  services: (vehicleId: number) => `vehicle-${vehicleId}_services`,
  service: (vehicleId: number, id: number) =>
    `vehicle-${vehicleId}_service-${id}`,
  expensesPrefix: (vehicleId: number) => `vehicle-${vehicleId}_expenses?`,
  expensesFiltered: (vehicleId: number, filters: unknown) =>
    `vehicle-${vehicleId}_expenses?${hash(filters ?? [])}`,
  expenses: (vehicleId: number) => `vehicle-${vehicleId}_expenses`,
  expense: (vehicleId: number, id: number) =>
    `vehicle-${vehicleId}_expense-${id}`,
  documents: (vehicleId: number) => `vehicle-${vehicleId}_documents`,
  document: (vehicleId: number, id: number) =>
    `vehicle-${vehicleId}_document-${id}`,

  manufacturers: () => `vehicleManufacturers`,
  manufacturerModels: (manufacturer: string) =>
    `vehicleManufacturer-${manufacturer.toLowerCase()}?models`,

  changelog: (vehicleId: number) => `vehicle-${vehicleId}_changelog`,
} as const;

export function keysWithPrefix(prefix: string): string[] {
  return Object.keys(useNuxtApp().payload.data).filter((k) =>
    k.startsWith(prefix),
  );
}

export function patchNuxtDataItem<T extends { id: number }>(
  key: string,
  updated: Partial<T>,
) {
  const cache = useNuxtData<T>(key);
  if (cache.data.value) {
    cache.data.value = { ...cache.data.value, ...updated };
  }
}

export function patchNuxtDataListByPrefix<T extends { id: number }>(
  prefix: string,
  id: number,
  updated: Partial<T>,
  opts: { existingKeysOnly?: boolean } = {},
) {
  for (const key of keysWithPrefix(prefix)) {
    const cache = useNuxtData<T[]>(key);
    if (!cache.data.value) continue;
    cache.data.value = cache.data.value.map((item) => {
      if (item.id !== id) return item;
      const next = opts.existingKeysOnly
        ? Object.fromEntries(Object.entries(updated).filter(([k]) => k in item))
        : updated;
      return { ...item, ...next };
    });
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

export function removeFromNuxtDataListByPrefix<T extends { id: number }>(
  prefix: string,
  id: number,
) {
  for (const key of keysWithPrefix(prefix)) {
    const cache = useNuxtData<T[]>(key);
    if (!cache.data.value) continue;
    cache.data.value = cache.data.value.filter((item) => item.id !== id);
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

export function prependToNuxtDataListByPrefix<T extends { id: number }>(
  prefix: string,
  item: T,
) {
  for (const key of keysWithPrefix(prefix)) {
    const cache = useNuxtData<T[]>(key);
    if (!cache.data.value) continue;
    if (cache.data.value.some((i) => i.id === item.id)) continue;
    cache.data.value = [item, ...cache.data.value];
  }
}
