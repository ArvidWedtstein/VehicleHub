import {
  PostgrestFilterBuilder,
  type PostgrestClientOptions,
} from "@supabase/postgrest-js";
import type { Database, Tables } from "~/types/supabase";

/**
 * Filters must be applied after any of select(), update(), upsert(), delete(), and rpc() and before modifiers.
 *
 * !TODO: finish filter options for generating dynamic filters for supabase querying
 * TODO: create a filter / POSTgrest operator map to handle all filter options
 * @param query
 * @param filters
 * @returns
 */
export const applyFilters = <
  TableName extends
    | keyof Database["public"]["Tables"]
    | keyof Database["public"]["Views"],
  Q extends PostgrestFilterBuilder<
    PostgrestClientOptions,
    Database["public"],
    Tables<TableName>,
    Tables<TableName>[],
    unknown,
    unknown,
    unknown
  >
>(
  query: Q,
  filters: FilterOption<Tables<TableName>>[],
  options: {
    matchAny?: boolean;
  } = { matchAny: false }
): Q => {
  if (!filters || filters.length === 0) {
    return query;
  }

  let q = query;
  const { matchAny } = options;

  if (matchAny) {
    const filterStrings = filters
      .map((filter) => {
        const { column, operator, value } = filter;
        const col = column as string;

        if (operator === "in" && Array.isArray(value)) {
          if (value.length === 0) {
            return null;
          }
          return `${col}.${operator}.(${value.join(", ")})`;
        }

        if (operator === "is" || value === null || typeof value === "boolean") {
          return `${col}.${operator}.${
            typeof value === "boolean" ? value : "null"
          }`;
        }

        if (
          ["like", "ilike", "cs", "cd"].includes(operator) &&
          typeof value === "string"
        ) {
          return `${col}.${operator}.${value}`;
        }

        if (["gt", "gte", "lt", "lte", "neq", "eq"].includes(operator)) {
          return `${col}.${operator}.${value as string}`;
        }

        // Handle number values without quotes
        return `${col}.${operator}.${value as string}`;
      })
      .filter(Boolean);

    if (filterStrings.length === 0) {
      return q;
    }

    q = q.or(filterStrings.join(", "));

    return q;
  }

  filters.forEach((filter) => {
    const { column, operator, value } = filter;
    const col = column as string;

    switch (operator) {
      case "eq":
        q = q.eq(col, value as Parameters<typeof q.eq>["1"]);
        break;
      case "neq":
        q = q.neq(col, value as Parameters<typeof q.eq>["1"]);
        break;
      case "gt":
        q = q.gt(col, value);
        break;
      case "gte":
        q = q.gte(col, value);
        break;
      case "lt":
        q = q.lt(col, value);
        break;
      case "lte":
        q = q.lte(col, value);
        break;
      case "like":
        if (typeof value === "string") {
          q = q.like(col, value);
        }
        break;
      case "ilike":
        if (typeof value === "string") {
          q = q.ilike(col, value);
        }
        break;
      case "in":
        if (Array.isArray(value) && value.length) {
          q = q.in(col, value);
        }
        break;
      case "is":
        q = q.is(
          col,
          typeof value === "boolean" ? value : operator === "is" ? null : null
        );
        break;
      case "cs":
        if (typeof value === "string" || Array.isArray(value)) {
          q = q.contains(col, value);
        }
        break;
      case "cd":
        if (typeof value === "string" || Array.isArray(value)) {
          q = q.containedBy(col, value);
        }
        break;
      case "ov":
        if (typeof value === "string" || Array.isArray(value)) {
          q = q.overlaps(col, value);
        }
        break;
      case "fts":
        if (typeof value === "string") {
          q = q.textSearch(col, value);
        }
        break;
      case "plfts":
        if (typeof value === "string") {
          q = q.textSearch(col, value, { type: "plain" });
        }
        break;
      case "phfts":
        if (typeof value === "string") {
          q = q.textSearch(col, value, { type: "phrase" });
        }
        break;
      case "wfts":
        if (typeof value === "string") {
          q = q.textSearch(col, value, { type: "websearch" });
        }
        break;
    }

    // TODO: fix type
    // if (operator === 'eq' && value != null && !Array.isArray(value)) {
    //   q = q.eq(col, value);
    // }
    // if (operator === 'neq' && value != null && !Array.isArray(value)) {
    //   q = q.neq(col, value);
    // }
  });

  return q as Q;
};
