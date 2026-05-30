type RouteParamType = "string" | "number" | "integer";

type RouteParamResult<T extends RouteParamType> = T extends "number"
  ? number | undefined
  : string | undefined;

/**
 * Get a route param as string or number.
 * Returns `undefined` if missing or invalid.
 */
export const useRouteParam = <T extends RouteParamType = "string">(
  name: string,
  type: T = "string" as T,
): ComputedRef<RouteParamResult<T>> => {
  const route = useRoute();

  return computed((): RouteParamResult<T> => {
    const raw = route.params[name];
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (value == null || value === "") return undefined;

    if (import.meta.dev && /\.\w+$/.test(value)) return undefined;

    if (type === "number") {
      const num = parseInt(value, 10);

      if (isNaN(num)) {
        console.warn(`Route param "${name}" is not a valid number:`, value);
        return undefined;
      }

      return num as RouteParamResult<T>;
    }

    return value as RouteParamResult<T>;
  });
};
