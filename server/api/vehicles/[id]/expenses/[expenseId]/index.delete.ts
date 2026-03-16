import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const expenseId = getRouterParam(event, "expenseId");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });
  if (!expenseId)
    throw createError({
      statusCode: 400,
      statusMessage: "No expense id provided",
    });

  if (!Number.isInteger(parseInt(id))) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID should be an integer",
    });
  }
  if (!Number.isInteger(parseInt(expenseId))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Expense ID should be an integer",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleExpenses")
    .delete()
    .eq("vehicle_id", parseInt(id))
    .eq("id", parseInt(expenseId));

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
