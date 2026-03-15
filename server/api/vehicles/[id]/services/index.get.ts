import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  const client = await serverSupabaseClient<Database>(event);

  const { data: services, error } = await client
    .from("vehicleservicelogs_with_items")
    .select(`*`)
    .eq("vehicle_id", parseInt(id))
    .order("date", { ascending: false })
    .select();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return services;
});
