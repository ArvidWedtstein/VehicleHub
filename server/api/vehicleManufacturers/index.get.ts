import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineCachedEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleManufacturers")
    .select("*")
    .neq("sort_order", 0);

  if (error) throw createError({ statusCode: status, statusText, ...error });
  return data;
});
