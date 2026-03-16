import { serverSupabaseClient } from "#supabase/server";
import { Database, TablesInsert } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const body = await readBody<{
    service: TablesInsert<"VehicleServiceLogs">;
    items?: TablesInsert<"VehicleServiceLogsItems">[];
  }>(event);

  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleServiceLogs")
    .insert(body.service)
    .eq("vehicle_id", parseInt(id))
    .select("*")
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  if (body.items && body.items?.length > 0) {
    const itemsToInsert = body.items?.map((item) => ({
      ...item,
      service_log_id: data.id,
    }));

    const { error: itemsError } = await client
      .from("VehicleServiceLogsItems")
      .insert(itemsToInsert);

    if (itemsError)
      throw createError({ statusCode: 500, statusMessage: itemsError.message });
  }

  return data;
});
