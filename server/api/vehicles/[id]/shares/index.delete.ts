import { serverSupabaseClient } from "#supabase/server";
import { Database, Tables } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const vehicleId = getRouterParam(event, "id");
  const { ids } = await readBody<{ ids: Tables<"VehicleShares">["id"][] }>(
    event,
  );

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!ids || (Array.isArray(ids) && !ids.length)) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  if (!Number.isInteger(parseInt(vehicleId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vehicle ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleShares")
    .delete()
    .in("id", ids)
    .eq("vehicle_id", parseInt(vehicleId));

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
