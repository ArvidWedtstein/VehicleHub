import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const vehicleId = getRouterParam(event, "id");
  const shareId = getRouterParam(event, "shareId");
  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!shareId)
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
  if (!Number.isInteger(parseInt(shareId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "share ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleShares")
    .delete()
    .eq("vehicle_id", parseInt(vehicleId))
    .eq("id", parseInt(shareId));

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
