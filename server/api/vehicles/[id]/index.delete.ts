import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!Number.isInteger(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("Vehicles")
    .delete()
    .eq("vehicle_id", parseInt(id));

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
