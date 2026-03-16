import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const vehicleId = getRouterParam(event, "id");

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("Vehicles")
    .select(
      `
      *,
      shares:VehicleShares (
        *,
        profile:Profiles (
          id,
          name,
          profile_image_url
        )  
      )
    `,
    )
    .eq("id", parseInt(vehicleId))
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  if (!data)
    throw createError({ statusCode: 404, statusMessage: "Vehicle not found" });

  return data;
});
