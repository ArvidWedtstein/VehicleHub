/**
 * Get a route param as string or number.
 * Returns `undefined` if missing or invalid.
 */
export const useRouteParam = <T extends "string" | "number">(
  name: string,
  type: T = "string" as T
): Ref<T extends "string" ? string | undefined : number | undefined> => {
  const route = useRoute();

  return computed(() => {
    const param = route.params[name];
    const value = Array.isArray(param) ? param[0] : param;
    if (!value) return undefined as any;

    if (type === "number") {
      const num = Number(value);
      return (isNaN(num) ? undefined : num) as any;
    }

    return value as any;
  });
};
