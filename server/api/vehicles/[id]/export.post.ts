import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database, Tables } from "~/types/supabase";
import { gzipSync } from "zlib";

export default defineEventHandler(async (event) => {
  const vehicleId = getRouterParam(event, "id");
  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const body = await readBody(event);

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  type Table = keyof Database["public"]["Tables"];

  const table = body.table as Table | undefined;
  const columns = body.columns as keyof Tables<Table>;

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!table) {
    throw createError({
      statusCode: 400,
      statusMessage: "No export table provided",
    });
  }

  const allowedTables: Table[] = ["VehicleExpenses", "VehicleServiceLogs"];
  if (!allowedTables.includes(table)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid export table provided",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from(table)
    .select(columns)
    .eq("vehicleId", vehicleId);

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  const csv = jsonToCsv(data);

  setHeader(event, "Content-Type", "text/csv");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename=${table}-export.csv`
  );

  return csv;
});
