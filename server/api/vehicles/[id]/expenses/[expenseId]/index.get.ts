import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const vehicleId = getRouterParam(event, "id");
  const expenseId = getRouterParam(event, "expenseId");

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!expenseId)
    throw createError({
      statusCode: 400,
      statusMessage: "No expense id provided",
    });

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleExpenses")
    .select("*")
    .eq("vehicle_id", parseInt(vehicleId))
    .eq("id", parseInt(expenseId))
    .single();

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
      message: error.message,
      cause: error.cause,
      stack: error.stack,
    });
  return data;
});
