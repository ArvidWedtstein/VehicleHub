import { serverSupabaseClient } from "#supabase/server";
import { Database, TablesUpdate } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, serviceId } = event.context.params as {
    id: string;
    serviceId: string;
  };
  const body = await readBody<{
    service: TablesUpdate<"VehicleServiceLogs">;
    items: TablesUpdate<"VehicleServiceLogsItems">[];
  }>(event);

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });
  if (!serviceId)
    throw createError({
      statusCode: 400,
      statusMessage: "No service id provided",
    });

  if (!Number.isInteger(parseInt(vehicleId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID should be an integer",
    });
  }
  if (!Number.isInteger(parseInt(serviceId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Service ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleServiceLogs")
    .update(body.service)
    .eq("id", parseInt(serviceId))
    .eq("vehicle_id", parseInt(vehicleId))
    .select();

  if (body.items && body.items.length > 0) {
    const { error: itemsError } = await client
      .from("VehicleServiceLogsItems")
      .upsert(
        body.items
          .filter((row) => row.id)
          .map((item) => ({
            ...item,
            service_log_id: parseInt(serviceId),
          })),
      )
      .eq("service_log_id", parseInt(serviceId));

    if (itemsError)
      throw createError({ statusCode: 500, statusMessage: itemsError.message });

    const { error: itemsInsertError } = await client
      .from("VehicleServiceLogsItems")
      .insert(
        body.items
          .filter((row) => !row.id)
          .map((item) => ({
            ...item,
            service_log_id: parseInt(serviceId),
          })),
      )
      .eq("service_log_id", parseInt(serviceId));

    if (itemsInsertError)
      throw createError({
        statusCode: 500,
        statusMessage: itemsInsertError.message,
      });
  }

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
