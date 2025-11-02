import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client.from("Profiles").select("*");

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
