import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleManufacturers")
    .select("*")
    .neq("sort_order", 0);

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
