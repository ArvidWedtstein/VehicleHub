import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const bodySchema = z.object({
  filters: z.any().array().default([]), // TODO: find better solution
  pagination: z
    .object({
      limit: z.number().min(-1),
      offset: z.number().min(0),
    })
    .optional(),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const { filters, pagination } = await readValidatedBody(
    event,
    bodySchema.parse,
  );

  const client = await serverSupabaseClient<Database>(event);

  let query = client
    .from("vehicleservicelogs_with_items")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("date", { ascending: false });

  if (filters && filters.length > 0) {
    query = applyFilters<"vehicleservicelogs_with_items", typeof query>(
      query,
      filters,
    );
  }

  if (pagination && pagination?.limit !== -1) {
    const { limit, offset } = pagination;
    query = query.range(offset, offset + limit - 1);

    console.log("Applying pagination", offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  return data;
});
