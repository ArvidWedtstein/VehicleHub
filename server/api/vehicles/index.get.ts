import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import defineAuthenticatedEventHandler from "~~/server/utils/defineAuthenticatedEventHandler";

export default defineAuthenticatedEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("Vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  return data;
});
