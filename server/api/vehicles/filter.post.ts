import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const filters = body.filters;

  const client = await serverSupabaseClient<Database>(event);

  let query = client
    .from("Vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  if (filters && filters.length > 0) {
    query = applyFilters<"Vehicles", typeof query>(query, filters);
  }

  const { data, error } = await query;

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  return data;
});
