import { serverSupabaseClient } from "#supabase/server";
import { Database, TablesUpdate } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, shareId } = event.context.params as {
    id: string;
    shareId: string;
  };
  const body = await readBody<TablesUpdate<"VehicleShares">>(event);

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });
  if (!shareId)
    throw createError({
      statusCode: 400,
      statusMessage: "No share id provided",
    });

  if (!Number.isInteger(parseInt(vehicleId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID should be an integer",
    });
  }
  if (!Number.isInteger(parseInt(shareId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Service ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleShares")
    .update(body)
    .eq("id", parseInt(shareId))
    .eq("vehicle_id", parseInt(vehicleId))
    .select();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
