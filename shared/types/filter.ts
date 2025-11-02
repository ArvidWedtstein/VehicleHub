export type FilterOperator =
  /**
   * Equals: column equals value
   */
  | "eq"
  /** Not equals: column does not equal value */
  | "neq"
  /** Greater than: column is greater than value */
  | "gt"
  /** Greater than or equal: column is greater than or equal to value */
  | "gte"
  /** Less than: column is less than value */
  | "lt"
  /** Less than or equal: column is less than or equal to value */
  | "lte"
  /** Pattern matching: case-sensitive LIKE */
  | "like"
  /** Pattern matching: case-insensitive LIKE */
  | "ilike"
  /** In list: column value is in the provided array */
  | "in"
  /** Is null or boolean check: column is null or matches boolean */
  | "is"
  /** Contains: Full-text search: column matches the full-text search query */
  | "cs"
  /** Contained by: Full-text search: column is contained by the full-text search query */
  | "cd"
  /** Slightly Left: strictly left of, e.g. ?range=sl.(1,10) */
  | "sl"
  /** Slightly Right: strictly right of, e.g. ?range=sr.(1,10) */
  | "sr"
  /** Not Extend Left: Does not extend to the left of value */
  | "nxl"
  /** Not Extend Right: Does not extend to the right of value */
  | "nxr"
  /** Adjacent: column value is adjacent to  */
  | "adj"
  /** Overlaps: (have points in common). Only relevant for array and range columns */
  | "ov"
  /** Full-text search: column matches the full-text search query using to_tsquery */
  | "fts"
  /** Full-text search: column matches the full-text search query using plainto_tsquery */
  | "plfts"
  /** Full-text search: column matches the full-text search query using phraseto_tsquery */
  | "phfts"
  /** Full-text search: column matches the full-text search query using websearch_to_tsquery */
  | "wfts";

export type FilterOption<Row> = {
  column: keyof Row;
  operator: FilterOperator;
  value: Row[keyof Row] | Row[keyof Row][] | keyof Row | null;
};
