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

export type FilterField<
  T extends keyof Tables,
  TP extends FilterFieldType = FilterFieldType,
> = {
  /** DB column this filter applies to */
  column: keyof Tables[T]["Row"];
  /** Human-friendly label */
  label: string;
  /** UI control type */
  type: TP;
  /** Default TP (no user selection) */
  operator?: FilterOperator;
  /** Predefined select options (for dropdowns) */
  options?: {
    label: string;
    value: Tables[T]["Row"][keyof Tables[T]["Row"]] extends string | undefined
      ? Tables[T]["Row"][keyof Tables[T]["Row"]]
      : string;
  }[];
  /** Range config */
  range?: { min: number; max: number; step?: number };

  default?:
    | Tables[T]["Row"][keyof Tables[T]["Row"]]
    | Tables[T]["Row"][keyof Tables[T]["Row"]][]
    | null;

  transform?: (
    value: unknown,
  ) => FilterOption<Tables[T]["Row"], any, any>[] | null;

  inputType?: TP extends "range" ? "slider" | "input" : never;
};

/**
 * A table’s complete filter schema.
 */
export type FilterSchema<Table extends Partial<keyof Tables>> =
  FilterField<Table>[];
