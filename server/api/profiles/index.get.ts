import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("Profiles")
    .select("*");

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
