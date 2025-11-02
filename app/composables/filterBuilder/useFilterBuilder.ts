import type { Database, Tables } from "~/types/supabase";
import type { FilterSchema, FilterField } from "./filterSchema";

export const useFilterBuilder = <
  Table extends keyof Database["public"]["Tables"]
>(
  schema: FilterSchema<Table>
) => {
  type Row = Tables<Table>;

  const getDefaultValue = (field: FilterField<Row>) => {
    switch (field.type) {
      case "select":
      case "multi-select":
        return [];
      case "boolean":
        return false;
      case "range":
        return [0, 0];
      case "date-range":
        return [null, null];
      default:
        return null;
    }
  };

  const filterState = reactive<
    Record<string, number | number[] | string | boolean | null>
  >(
    Object.fromEntries(
      schema.map((f) => [
        f.column as string,
        Array.isArray(f.default)
          ? [...f.default]
          : f.default ?? getDefaultValue(f),
      ])
    )
  );

  const buildFilters = computed<FilterOption<Row>[]>(() => {
    const filters: FilterOption<Row>[] = [];

    for (const field of schema) {
      const value = filterState[field.column as string];
      if (value === null || value === "" || value === undefined) continue;

      if (field.transform) {
        const result = field.transform(value);
        if (result) filters.push(...result);
        continue;
      }

      switch (field.type) {
        case "range":
        case "date-range":
          if (Array.isArray(value)) {
            const [min, max] = value;

            if (min == 0 && max === 0) break;

            if (min != null)
              filters.push({
                column: field.column,
                operator: "gte",
                value: min as Row[keyof Row],
              });
            if (max != null)
              filters.push({
                column: field.column,
                operator: "lte",
                value: max as Row[keyof Row],
              });
          }
          break;

        case "multi-select":
          if (Array.isArray(value) && value.length > 0) {
            filters.push({
              column: field.column,
              operator: "in",
              value: value as Row[keyof Row],
            });
          }
          break;

        case "boolean":
        case "date":
          filters.push({
            column: field.column,
            operator: field.operator ?? "eq",
            value: value as Row[keyof Row],
          });
          break;

        case "text":
          filters.push({
            column: field.column,
            operator: field.operator ?? "ilike",
            value: value as Row[keyof Row],
          });
          break;

        default:
          filters.push({
            column: field.column,
            operator: field.operator ?? "eq",
            value: value as Row[keyof Row],
          });
      }
    }

    return filters;
  });

  const resetFilters = () => {
    for (const field of schema) {
      const key = field.column as string;
      filterState[key] = Array.isArray(field.default)
        ? [...field.default]
        : field.default ?? getDefaultValue(field);
    }
  };

  return { schema, filterState, buildFilters, resetFilters };
};
