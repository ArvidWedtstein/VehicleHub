type RouteParamResult<T extends "string" | "number"> = T extends "string"
  ? string | undefined
  : number | undefined;

/**
 * Get a route param as string or number.
 * Returns `undefined` if missing or invalid.
 */
export const useRouteParam = <T extends "string" | "number" = "string">(
  name: string,
  type: T = "string" as T,
): ComputedRef<RouteParamResult<T>> => {
  const route = useRoute();

  return computed((): RouteParamResult<T> => {
    const param = route.params[name];
    const value = Array.isArray(param) ? param[0] : param;
    if (!value) return undefined;

    if (type === "number") {
      const num = Number(value);

      if (isNaN(num)) {
        console.warn(`Route param "${name}" is not a valid number:`, value);
        return undefined;
      }

      return num as RouteParamResult<T>;
    }

    return value as RouteParamResult<T>;
  });
};
