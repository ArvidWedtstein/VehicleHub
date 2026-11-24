import fs from "node:fs";
import path from "node:path";

const TYPES_PATH = path.resolve("app/types/supabase.ts");
let code = fs.readFileSync(TYPES_PATH, "utf8");

// 1. Extract all non-nullable columns for every table from the `Tables:` block
const tablesBlock = code.match(
  /Tables:\s*\{([\s\S]*?)\n\s{4}\}\n\s{4}Views:/,
)?.[1];
if (!tablesBlock) throw new Error("Tables block not found");

const tableNonNullCols = new Map<string, Set<string>>();
for (const m of tablesBlock.matchAll(
  /(\w+):\s*\{\s*Row:\s*\{([\s\S]*?)\n\s{8}\}/g,
)) {
  const [, tableName, rowBody] = m;
  const cols = new Set<string>();
  for (const line of rowBody.split("\n")) {
    const col = line.match(/^\s*(\w+):\s*(.+)$/);
    if (col && !col[2].includes("| null")) cols.add(col[1]);
  }
  tableNonNullCols.set(tableName, cols);
}

// 2. Patch `Views:` using `Relationships` (or matching table prefix) already inside the file
code = code.replace(
  /(Views:\s*\{)([\s\S]*?)(\n\s{4}\}\n\s{4}Functions:)/,
  (_, prefix, viewsBody, suffix) => {
    const patchedViews = viewsBody.replace(
      /(\w+):\s*\{\s*Row:\s*\{([\s\S]*?)\n\s{8}\}([\s\S]*?Relationships:\s*\[([\s\S]*?)\])/g,
      (
        fullView: string,
        viewName: string,
        rowBody: string,
        rest: string,
        relBody: string,
      ) => {
        // Find referenced base tables from the view's Relationships block
        const refTables = [
          ...relBody.matchAll(/referencedRelation:\s*"(\w+)"/g),
        ].map((r) => r[1]);

        // Fallback: match view name prefix (e.g. `vehicle_expenses_converted` -> `VehicleExpenses`)
        const normalizedView = viewName.replace(/_/g, "").toLowerCase();
        for (const tableName of tableNonNullCols.keys()) {
          if (normalizedView.startsWith(tableName.toLowerCase())) {
            refTables.push(tableName);
          }
        }

        const nonNullCols = new Set<string>();
        for (const t of refTables) {
          tableNonNullCols.get(t)?.forEach((c) => nonNullCols.add(c));
        }
        if (nonNullCols.size === 0) return fullView;

        const patchedRows = rowBody
          .split("\n")
          .map((line) => {
            const col = line.match(/^(\s*)(\w+):\s*(.+?)\s*\|\s*null\s*$/);
            return col && nonNullCols.has(col[2])
              ? `${col[1]}${col[2]}: ${col[3]}`
              : line;
          })
          .join("\n");

        return fullView.replace(rowBody, patchedRows);
      },
    );
    return `${prefix}${patchedViews}${suffix}`;
  },
);

fs.writeFileSync(TYPES_PATH, code, "utf8");
