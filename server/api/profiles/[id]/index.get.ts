import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No profile id provided",
    });

  if (!Number.isInteger(parseInt(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Profile ID should be an integer",
    });
  }

  const { data, error } = await client
    .from("Profiles")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
