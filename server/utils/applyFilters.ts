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
  is_not: {
    apply: (q, c, v) => q.not(c, "is", v),
    or: (c, v) => `${c}.not.is.${v ?? "null"}`,
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

  return q as Q;
};
