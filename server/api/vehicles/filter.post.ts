import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const BodySchema = z.object({
  filters: z.array(z.any()).optional().default([]),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { filters } = await readValidatedBody(event, BodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  let query = client
    .from("Vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  query = applyFilters<"Vehicles", typeof query>(query, filters, {
    matchAny: true,
  });

  const { data, error } = await query;

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  return data;
});
