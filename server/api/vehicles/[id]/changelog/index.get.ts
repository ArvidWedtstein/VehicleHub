import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!Number.isInteger(parseInt(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vehicle ID should be an integer",
    });
  }

  const { data, error } = await client
    .from("changelog_with_profile")
    .select("*")
    .order("created_at", { ascending: false })
    .eq("vehicle_id", parseInt(id));

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
