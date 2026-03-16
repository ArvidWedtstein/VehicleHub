import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({ statusCode: 400, statusMessage: "No id provided" });

  const body = await readBody(event);

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const filters = body.filters;

  const client = await serverSupabaseClient<Database>(event);

  let query = client
    .from("VehicleExpenses")
    .select("*")
    .eq("vehicle_id", parseInt(id))
    .order("date", { ascending: false });

  if (filters && filters.length > 0) {
    query = applyFilters<"VehicleExpenses", typeof query>(query, filters);
  }

  if (body.pagination) {
    const { limit, offset } = body.pagination;
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  return data;
});
