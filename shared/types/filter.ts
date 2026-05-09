const _FilterOperatorDocs = {
  /**
   * Equals: column equals value
   */
  eq: "eq",
  /** Not equals: column does not equal value */
  neq: "neq",
  /** Greater than: column is greater than value */
  gt: "gt",
  /** Greater than or equal: column is greater than or equal to value */
  gte: "gte",
  /** Less than: column is less than value */
  lt: "lt",
  /** Less than or equal: column is less than or equal to value */
  lte: "lte",
  /** Pattern matching: case-sensitive LIKE */
  like: "like",
  /** Pattern matching: case-insensitive LIKE */
  ilike: "ilike",
  /** In list: column value is in the provided array */
  in: "in",
  /** Is null or boolean check: column is null or matches boolean */
  is: "is",
  /** Contains: Full-text search: column matches the full-text search query */
  cs: "cs",
  /** Contained by: Full-text search: column is contained by the full-text search query */
  cd: "cd",
  /** Slightly Left: strictly left of, e.g. ?range=sl.(1,10) */
  // sl: "sl",
  // /** Slightly Right: strictly right of, e.g. ?range=sr.(1,10) */
  // sr: "sr",
  // /** Not Extend Left: Does not extend to the left of value */
  // nxl: "nxl",
  // /** Not Extend Right: Does not extend to the right of value */
  // nxr: "nxr",
  // /** Adjacent: column value is adjacent to  */
  // adj: "adj",
  /** Overlaps: (have points in common). Only relevant for array and range columns */
  ov: "ov",
  /** Full-text search: column matches the full-text search query using to_tsquery */
  fts: "fts",
  /** Full-text search: column matches the full-text search query using plainto_tsquery */
  plfts: "plfts",
  /** Full-text search: column matches the full-text search query using phraseto_tsquery */
  phfts: "phfts",
  /** Full-text search: column matches the full-text search query using websearch_to_tsquery */
  wfts: "wfts",
} as const;

type OperatorValue<Op extends FilterOperator, T> = Op extends "in"
  ? T[]
  : Op extends "is"
    ? boolean | null
    : Op extends "like" | "ilike" | "fts" | "plfts" | "phfts" | "wfts"
      ? string
      : T;

export type FilterOperator = keyof typeof _FilterOperatorDocs;

export type FilterOption<
  Row,
  K extends keyof Row = keyof Row,
  Op extends FilterOperator = FilterOperator,
> = {
  column: K;
  operator: Op;
  // value: Row[keyof Row] | Row[keyof Row][] | keyof Row | null;
  value: OperatorValue<Op, Row[K]>;
};
