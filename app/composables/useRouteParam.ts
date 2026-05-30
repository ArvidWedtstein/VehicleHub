type RouteParamType = "string" | "number" | "integer";

type RouteParamResult<T extends RouteParamType> = T extends "number"
  ? number
  : string;

interface RouteParamOptions<T extends RouteParamType> {
  type?: T;
}

/**
 * Get a route param as string or number.
 * Returns `undefined` if missing or invalid.
 */
export function useRouteParam<T extends RouteParamType = "string">(
  name: string,
  options: RouteParamOptions<T> & { required: true },
): ComputedRef<RouteParamResult<T>>;

export function useRouteParam<T extends RouteParamType = "string">(
  name: string,
  options?: RouteParamOptions<T> & { required?: false },
): ComputedRef<RouteParamResult<T> | undefined>;

export function useRouteParam<T extends RouteParamType = "string">(
  name: string,
  options?: RouteParamOptions<T> & { required?: boolean },
): ComputedRef<RouteParamResult<T> | undefined> {
  const route = useRoute();
  const { type, required = false } = options ?? {};

  return computed((): RouteParamResult<T> | undefined => {
    const raw = route.params[name];
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (value == null || value === "") {
      if (required)
        throw new Error(`Required route param "${name}" is missing`);
      return undefined;
    }

    if (import.meta.dev && /\.\w+$/.test(value)) return undefined;

    if (type === "number") {
      const num = parseInt(value, 10);

      if (isNaN(num)) {
        if (required)
          throw new Error(
            `Required route param "${name}" is not a valid number: ${value}`,
          );
        console.warn(`Route param "${name}" is not a valid number:`, value);
        return undefined;
      }

      return num as RouteParamResult<T>;
    }

    return value as RouteParamResult<T>;
  });
}
