import { serverSupabaseClient } from "#supabase/server";
import { Database, Tables } from "~/types/supabase";
import { gzipSync } from "zlib";
import z from "zod";

const ACCEPTED_TABLES: (keyof Pick<
  Database["public"]["Tables"],
  "VehicleExpenses" | "VehicleServiceLogs" | "VehicleShares"
>)[] = ["VehicleExpenses", "VehicleServiceLogs", "VehicleShares"];

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  table: z.enum(ACCEPTED_TABLES),
  columns: z.array(z.string()).min(1),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { table, columns } = await readValidatedBody(event, bodySchema.parse);

  if (!table) {
    throw createError({
      statusCode: 400,
      statusMessage: "No export table provided",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from(table)
    .select(...columns)
    .eq("vehicle_id", vehicleId);

  if (error) throw createError({ statusCode: status, statusText, ...error });

  // TODO: fix
  const csv = jsonToCsv(data as unknown as Record<string, unknown>[]);

  setHeader(event, "Content-Type", "text/csv");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename=${table}-export.csv`,
  );

  return csv;
});
