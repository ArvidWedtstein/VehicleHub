import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({ statusCode: 400, statusMessage: "No id provided" });

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleServiceLogs")
    .select("*")
    .eq("vehicle_id", parseInt(id))
    .order("date", { ascending: false })
    .select();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
