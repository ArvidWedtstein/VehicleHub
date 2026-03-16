import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("Vehicles")
    .insert(body)
    .select("*")
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
