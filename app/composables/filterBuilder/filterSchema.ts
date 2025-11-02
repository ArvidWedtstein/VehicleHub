import type { Database, Tables } from "~/types/supabase";

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

export type FilterField<Row> = {
  /** DB column this filter applies to */
  column: keyof Row;
  /** Human-friendly label */
  label: string;
  /** UI control type */
  type: FilterFieldType;
  /** Default operator (no user selection) */
  operator?: FilterOption<Row>["operator"];
  /** Predefined select options (for dropdowns) */
  options?: { label: string; value: any }[];
  /** Range config */
  range?: { min: number; max: number; step?: number };

  /** TODO: fix type */
  default?: any;

  transform?: (value: any) => FilterOption<Row>[] | null;
};

/**
 * A table’s complete filter schema.
 */
export type FilterSchema<Table extends keyof Database["public"]["Tables"]> =
  FilterField<Tables<Table>>[];
