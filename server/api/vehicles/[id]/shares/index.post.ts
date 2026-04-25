import { serverSupabaseClient } from "#supabase/server";
import { Database, TablesInsert } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const body =
    await readBody<
      (TablesInsert<"VehicleShares"> | TablesInsert<"VehicleShares">)[]
    >(event);

  const vehicleId = getRouterParam(event, "id");
  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!body || (Array.isArray(body) && !body.length)) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleShares")
    .insert(Array.isArray(body) ? body : [body])
    .eq("vehicle_id", parseInt(vehicleId))
    .select("*");

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
