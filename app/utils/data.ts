/**
 * Returns a pluralized string based on the count and noun provided.
 *
 * @param {number} count - The number of items.
 * @param {string} noun - The noun to be pluralized.
 * @param {string} [suffix='s'] - The suffix to be added to the noun.
 * @param {boolean} [includeCount=true] - The suffix to be added to the noun.
 * @return {string} - The pluralized string.
 */
export const pluralize = (
  count: number,
  noun: string,
  suffix = "s",
  includeCount: boolean = true,
): string => `${includeCount ? count : ""} ${noun}${count !== 1 ? suffix : ""}`;

// Helper function to safely access nested properties with strict typing
export const getNestedProperty = <
  T extends Record<string, unknown>, // Base object type
  K extends Array<keyof T>, // Array of keys (generic)
>(
  obj: T,
  keys: K,
) => {
  return keys.reduce<unknown>((acc, currentKey) => {
    if (acc && typeof acc === "object" && currentKey in acc) {
      return (acc as Record<string, unknown>)[currentKey as string];
    }
    return undefined;
  }, obj);
};

export const groupBy = <T extends Record<string, unknown>>(
  array: T[],
  key: keyof T | ((item: T) => string | number),
): { [groupKey: string]: T[] } => {
  return array.reduce((acc: { [groupKey: string]: T[] }, obj: T) => {
    let groupKey: string | number | unknown;

    if (typeof key === "function") {
      groupKey = key(obj);
    } else {
      const nestedKeys =
        typeof key === "string" ? key.split(".") : [key as unknown as string];
      groupKey = getNestedProperty(obj, nestedKeys);
    }

    const groupKeyStr = String(groupKey);

    if (!acc[groupKeyStr]) {
      acc[groupKeyStr] = [];
    }

    acc[groupKeyStr].push(obj);
    return acc;
  }, {});
};

/**
 * @description Dabounce
 * @param func
 * @param delay
 * @returns
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Converts array type to single type
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ColumnsToReturn<T, C> = C extends "*"
  ? T
  : Pick<T, Extract<C, keyof T>>;

export type FilterKeys<T> = {
  [K in keyof T]?: T[K];
};

export const stripDiacritics = (string: string) => {
  return typeof string.normalize !== "undefined"
    ? string.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : string;
};

export const generateDistinctColors = (numColors: number): string[] => {
  const colors: string[] = [];

  const lightness = 30;
  const saturation = 70;

  for (let i = 0; i < numColors; i++) {
    // Space hues to ensure colors are evenly distributed
    const hue = (i * (360 / numColors)) % 360;

    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    colors.push(color);
  }

  return colors;
};

type Change<T> = {
  field: keyof T;
  oldValue: T[keyof T] | undefined;
  newValue: T[keyof T] | undefined;
};

export const calculateJsonChanges = <T>(
  oldValues: Partial<T> | undefined,
  newValues: Partial<T> | undefined,
): Change<T>[] => {
  const changes: Change<T>[] = [];

  // Get the union of all keys from old and new
  const allKeys = new Set<keyof T>([
    ...(oldValues ? Object.keys(oldValues) : []),
    ...(newValues ? Object.keys(newValues) : []),
  ] as (keyof T)[]);

  // Compare values for each key
  for (const key of allKeys) {
    const oldValue = oldValues?.[key];
    const newValue = newValues?.[key];

    if (oldValue !== newValue) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
};

/**
 * Extracts initials from a given name.
 * @param name The full name from which to extract initials.
 * @param maxInitials The maximum number of initials to include (default is 2).
 * @returns The initials as a string.
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name.trim()) {
    return "";
  }

  const words = name.trim().split(/\s+/);

  const initials = words
    .slice(0, maxInitials)
    .map((word) => word[0]?.toUpperCase());

  return initials.join("");
};

type SortOrder = "asc" | "desc";

/**
 * Dynamically sorts an array of objects based on a specified key or keys.
 * @param array - The array to sort.
 * @param key - The key (or keys) to sort by. For nested properties, use dot notation (e.g., "address.city").
 * @param order - The order of sorting: 'asc' for ascending or 'desc' for descending.
 * @returns A new sorted array.
 */
export const dynamicSort = <T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc",
): T[] => {
  if (!Array.isArray(array) || array.length === 0) {
    return array;
  }

  return array.slice().sort((a, b) => {
    const getValue = (obj: T, path: string): unknown => {
      return path.split(".").reduce((value, part) => {
        if (value && typeof value === "object" && part in value) {
          return (value as Record<string, unknown>)[part];
        }
        return undefined;
      }, obj as unknown);
    };

    const valueA = getValue(a, key.toString());
    const valueB = getValue(b, key.toString());

    if (valueA === valueB) {
      return 0;
    }

    if (
      valueA === undefined ||
      valueA === null ||
      valueB === undefined ||
      valueB === null
    ) {
      throw new Error(
        `Property "${key.toString()}" does not exist on some objects.`,
      );
    }

    const comparison = valueA > valueB ? 1 : -1;
    return order === "asc" ? comparison : -comparison;
  });
};

/** Removes key from object */
export const removeKeys = <T extends Record<string, unknown>>(
  obj: T,
  keysToRemove: (keyof T)[],
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key]) => !keysToRemove.includes(key as keyof T),
    ),
  ) as Partial<T>;
};

type ExtractKey<T> =
  T extends Array<infer U>
    ? U extends object
      ? keyof U
      : never
    : T extends object
      ? keyof T
      : never;

/**
 * Returns the sum of an array of numbers.
 *
 * @param {number[]} numbers - The array of numbers to sum.
 * @returns {number} The sum of the numbers in the array.
 *
 * @example
 * sum([1, 2, 3, 4]); // 10
 */
export const sum = <
  T extends
    | (number | { [key: string]: unknown })[]
    | { [key: string]: unknown },
>(
  input: T,
  key?: ExtractKey<T>,
): number => {
  if (Array.isArray(input)) {
    return input.reduce((acc: number, item) => {
      if (typeof item === "number") {
        return acc + item;
      }
      if (Array.isArray(item)) {
        return acc + sum(item, key as ExtractKey<typeof item>);
      }
      if (typeof item === "object" && item !== null) {
        return acc + sum(item, key as ExtractKey<typeof item>);
      }
      return acc;
    }, 0);
  }

  if (typeof input === "object" && input !== null) {
    let total = 0;

    // If a key is provided, sum the values of that key
    if (key) {
      if (key in input) {
        const value = input[key];
        if (typeof value === "number") {
          total += value; // Add the numeric value of the key
          return total;
        }
      }
    }

    // Recursively sum values of nested objects or arrays
    for (const value of Object.values(input)) {
      if (typeof value === "number") {
        total += value;
      } else if (Array.isArray(value)) {
        total += sum(value, key as ExtractKey<typeof value>);
      } else if (typeof value === "object" && value !== null) {
        total += sum(
          value as { [key: string]: unknown },
          key as ExtractKey<typeof value>,
        );
      }
    }

    return total;
  }

  return 0;
};
