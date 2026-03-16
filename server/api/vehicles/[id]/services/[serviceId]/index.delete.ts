import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const vehicleId = getRouterParam(event, "id");
  const serviceId = getRouterParam(event, "serviceId");

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

  if (!Number.isInteger(parseInt(vehicleId)))
    throw createError({
      statusCode: 400,
      statusMessage: "ID should be an integer",
    });

  if (!Number.isInteger(parseInt(serviceId)))
    throw createError({
      statusCode: 400,
      statusMessage: "service ID should be an integer",
    });

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleServiceLogs")
    .delete()
    .eq("vehicle_id", parseInt(vehicleId))
    .eq("id", parseInt(serviceId));

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
