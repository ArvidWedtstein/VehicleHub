import type { Database, Tables } from "~/types/supabase";
import type { TablesAndViews, FilterSchema, FilterField } from "./filterSchema";

export const useFilterBuilder = <Table extends keyof TablesAndViews>(
  schema: FilterSchema<Table>,
) => {
  type Row = TablesAndViews[Table]["Row"];

  type C = FilterSchema<Table>[number]["column"];

  type State = {
    [K in C]: Row[K] | Row[K][] | null;
  };

  const getDefaultValue = (field: FilterField<Table>): State[C] => {
    if (field.default !== undefined)
      return structuredClone(field.default) as State[C];

    switch (field.type) {
      case "select":
      case "multi-select":
        return [] as State[C];
      case "boolean":
        return false as State[C];
      case "range":
      case "date-range":
        return [null, null] as State[C];
      default:
        return null as State[C];
    }
  };

  const filterState = reactive(
    Object.fromEntries(schema.map((f) => [f.column, getDefaultValue(f)])),
  );

  const buildFilters = computed<FilterOption<Row>[]>(() => {
    const filters: FilterOption<Row>[] = [];

    for (const field of schema) {
      const value = filterState[field.column as keyof typeof filterState];
      if (value == null || value === "") continue;

      if (field.transform) {
        const result = field.transform(value);
        if (result) filters.push(...result);
        continue;
      }

      switch (field.type) {
        case "range":
        case "date-range": {
          const [min, max] = value as any[];

          if (min != null)
            filters.push({
              column: field.column,
              operator: "gte",
              value: min,
            });

          if (max != null)
            filters.push({
              column: field.column,
              operator: "lte",
              value: max,
            });

          break;
        }

        case "multi-select":
          if (Array.isArray(value) && value.length > 0) {
            filters.push({
              column: field.column,
              operator: "in",
              value,
            });
          }
          break;

        case "text":
        case "search":
          filters.push({
            column: field.column,
            operator: field.operator ?? "ilike",
            value,
          });
          break;

        default:
          filters.push({
            column: field.column,
            operator: field.operator ?? "eq",
            value,
          });
      }
    }

    return filters;
  });

  const resetFilters = () => {
    for (const field of schema) {
      if (field.column in filterState) {
        console.log(
          "reset ",
          field,
          filterState[field.column as keyof typeof filterState],
          getDefaultValue(field),
        );
        filterState[field.column as keyof typeof filterState] =
          getDefaultValue(field);
      } else {
        console.log("Not on ", field);
      }
    }
  };

  return { schema, filterState, buildFilters, resetFilters };
};
