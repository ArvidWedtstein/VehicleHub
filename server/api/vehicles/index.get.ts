import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("Vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error)
    throw createError({
      statusCode: status,
      statusText,
      ...error,
    });

  return data;
});
