const fuzzyMatch = (
  term: string,
  candidate: string
): { score: number; index: number } | null => {
  let bestScore = -1;
  let bestIndex = -1;

  for (let i = 0; i <= candidate.length - term.length; i++) {
    const slice = candidate.slice(i, i + term.length);
    let score = 0;

    for (let j = 0; j < term.length; j++) {
      if (slice[j] === term[j]) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestScore > 0 ? { score: bestScore, index: bestIndex } : null;
};

type MatchFrom = "any" | "start";
type ReturnTypeMode = "option" | "meta" | "both";

interface FilterConfig<T, R extends ReturnTypeMode = "option"> {
  ignoreAccents?: boolean;
  ignoreCase?: boolean;
  limit?: number;
  matchFrom?: MatchFrom;
  stringify?: (option: T) => string;
  trim?: boolean;
  fuzzy?: boolean;
  returnType?: R;
  rankResults?: boolean;
}

interface FilterState {
  searchTerm: string;
}

interface MatchMeta {
  index: number;
  length: number;
}

interface FilteredResult<T> {
  option: T;
  matchMeta?: MatchMeta;
  score?: number;
}

export function createFilterOptions<T>(
  config: FilterConfig<T> & { returnType: "option" }
): (options: T[], state: FilterState) => T[];

export function createFilterOptions<T>(
  config: FilterConfig<T> & { returnType: "meta" }
): (
  options: T[],
  state: FilterState
) => Array<Omit<FilteredResult<T>, "option">>;

export function createFilterOptions<T>(
  config: FilterConfig<T> & { returnType: "both" }
): (options: T[], state: FilterState) => FilteredResult<T>[];

export function createFilterOptions<T, R extends ReturnTypeMode = "option">(
  config: FilterConfig<T, R> = {}
) {
  const {
    ignoreAccents = true,
    ignoreCase = true,
    limit,
    matchFrom = "any",
    stringify = (option: T) => String(option),
    trim = false,
    fuzzy = false,
    returnType = "option" as R,
    rankResults = false,
  } = config;

  const filterOptions = (options: T[], { searchTerm }: FilterState) => {
    let search = searchTerm;

    if (trim) search = search.trim();
    if (ignoreCase) search = search.toLowerCase();
    if (ignoreAccents) search = stripDiacritics(search);

    const results: FilteredResult<T>[] = [];

    for (const option of options) {
      let label = stringify(option);
      if (ignoreCase) label = label.toLowerCase();
      if (ignoreAccents) label = stripDiacritics(label);

      if (!search) {
        results.push({ option });
        continue;
      }

      if (fuzzy) {
        const match = fuzzyMatch(search, label);
        if (match) {
          results.push({
            option,
            matchMeta: { index: match.index, length: search.length },
            score: rankResults ? match.score : undefined,
          });
        }
      } else {
        const index =
          matchFrom === "start"
            ? label.indexOf(search) === 0
              ? 0
              : -1
            : label.indexOf(search);
        if (index !== -1) {
          results.push({
            option,
            matchMeta: { index, length: search.length },
          });
        }
      }
    }

    if (rankResults && fuzzy) {
      results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }

    const limited =
      typeof limit === "number" ? results.slice(0, limit) : results;

    if (returnType === "option") {
      return limited.map((r) => r.option);
    } else if (returnType === "meta") {
      return limited.map(({ matchMeta, score }) => ({ matchMeta, score }));
    } else {
      return limited;
    }
  };

  return filterOptions;
}
