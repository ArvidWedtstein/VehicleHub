import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
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
    .from("VehicleExpenses")
    .insert(body)
    .eq("vehicle_id", parseInt(id))
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
