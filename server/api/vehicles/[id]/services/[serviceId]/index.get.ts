import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
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

  if (!Number.isInteger(parseInt(vehicleId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vehicle ID should be an integer",
    });
  }

  if (!Number.isInteger(parseInt(serviceId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Service ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data: service, error } = await client
    .from("VehicleServiceLogs")
    .select(
      `
      *,
      items:VehicleServiceLogsItems (*),
      files:VehicleDocuments (*)
    `
    )
    .eq("vehicle_id", parseInt(vehicleId))
    .eq("id", parseInt(serviceId))
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return service;
});
