import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const BodySchema = z.object({
  filters: z.array(z.any()).optional(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const body = await readValidatedBody(event, BodySchema.safeParse);

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const filters = body.data?.filters || [];

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
