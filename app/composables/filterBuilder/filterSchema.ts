import type { Database } from "~/types/supabase";

export type FilterFieldType =
  | "select"
  | "multi-select"
  | "range"
  | "text"
  | "search"
  | "boolean"
  | "date"
  | "date-range"
  | "number"
  | "custom"; // fallback for advanced cases

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];

export type TablesAndViews = Tables & Views;

type Row<T extends keyof TablesAndViews> = TablesAndViews[T]["Row"];
type RowValue<T extends keyof TablesAndViews> = Row<T>[keyof Row<T>];

export type FilterField<
  T extends keyof TablesAndViews,
  TP extends FilterFieldType = FilterFieldType,
> = {
  /** DB column this filter applies to */
  column: keyof Row<T>;
  /** Human-friendly label */
  label: string;
  /** UI control type */
  type: TP;
  /** Default TP (no user selection) */
  operator?: FilterOperator;
  /** Predefined select options (for dropdowns) */
  options?: {
    label: string;
    value: RowValue<T> extends string | undefined ? RowValue<T> : string;
  }[];
  /** Range config */
  range?: { min: number; max: number; step?: number };

  default?: RowValue<T> | RowValue<T>[] | null;

  transform?: (value: unknown) => FilterOption<Row<T>>[] | null;

  inputType?: TP extends "range" ? "slider" | "input" : never;
};

/**
 * A table’s complete filter schema.
 */
export type FilterSchema<Table extends Partial<keyof TablesAndViews>> =
  FilterField<Table>[];
