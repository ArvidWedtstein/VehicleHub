import {
  PostgrestFilterBuilder,
  type PostgrestClientOptions,
} from "@supabase/postgrest-js";
import type { Database, Tables } from "~/types/supabase";

type ApplyFn = (q: any, col: string, value: any) => any;
type OrSerializeFn = (col: string, value: any) => string | null;

const OperatorMap: Record<
  FilterOperator,
  { apply: ApplyFn; or: OrSerializeFn }
> = {
  eq: { apply: (q, c, v) => q.eq(c, v), or: (c, v) => `${c}.eq.${v}` },
  neq: { apply: (q, c, v) => q.neq(c, v), or: (c, v) => `${c}.neq.${v}` },
  gt: { apply: (q, c, v) => q.gt(c, v), or: (c, v) => `${c}.gt.${v}` },
  gte: { apply: (q, c, v) => q.gte(c, v), or: (c, v) => `${c}.gte.${v}` },
  lt: { apply: (q, c, v) => q.lt(c, v), or: (c, v) => `${c}.lt.${v}` },
  lte: { apply: (q, c, v) => q.lte(c, v), or: (c, v) => `${c}.lte.${v}` },
  like: { apply: (q, c, v) => q.like(c, v), or: (c, v) => `${c}.like.${v}` },
  ilike: { apply: (q, c, v) => q.ilike(c, v), or: (c, v) => `${c}.ilike.${v}` },
  in: {
    apply: (q, c, v) => q.in(c, v),
    or: (c, v) => `${c}.in.(${v.join(",")})`,
  },
  is: {
    apply: (q, c, v) => q.is(c, v),
    or: (c, v) => `${c}.is.${v ?? "null"}`,
  },
  cs: { apply: (q, c, v) => q.contains(c, v), or: (c, v) => `${c}.cs.${v}` },
  cd: { apply: (q, c, v) => q.containedBy(c, v), or: (c, v) => `${c}.cd.${v}` },
  ov: { apply: (q, c, v) => q.overlaps(c, v), or: (c, v) => `${c}.ov.${v}` },
  fts: {
    apply: (q, c, v) => q.textSearch(c, v),
    or: (c, v) => `${c}.fts.${v}`,
  },
  plfts: {
    apply: (q, c, v) => q.textSearch(c, v, { type: "plain" }),
    or: (c, v) => `${c}.plfts.${v}`,
  },
  phfts: {
    apply: (q, c, v) => q.textSearch(c, v, { type: "phrase" }),
    or: (c, v) => `${c}.phfts.${v}`,
  },
  wfts: {
    apply: (q, c, v) => q.textSearch(c, v, { type: "websearch" }),
    or: (c, v) => `${c}.wfts.${v}`,
  },
};
/**
 * Filters must be applied after any of select(), update(), upsert(), delete(), and rpc() and before modifiers.
 *
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
  >,
>(
  query: Q,
  filters: FilterOption<Tables<TableName>>[],
  options: {
    matchAny?: boolean;
  } = { matchAny: false },
): Q => {
  if (!filters?.length) return query;

  let q = query;
  if (options.matchAny) {
    const parts = filters
      .map((f) => OperatorMap[f.operator].or(f.column as string, f.value))
      .filter(Boolean);

    return parts.length ? q.or(parts.join(",")) : q;
  }

  for (const f of filters) {
    q = OperatorMap[f.operator].apply(q, f.column as string, f.value);
  }

  /*filters.forEach((filter) => {
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
          typeof value === "boolean" ? value : operator === "is" ? null : null,
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
  });*/

  return q as Q;
};
