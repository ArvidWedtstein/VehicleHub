import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const BodySchema = z.object({
  filters: z.any().array().default([]), // TODO: find better solution
  pagination: z
    .object({
      limit: z.number().min(-1),
      offset: z.number().min(0),
    })
    .optional(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: z.coerce.number({
        error: (val) => `Invalid Vehicle ID type provided ${val.message}`,
      }),
    }).parse,
  );
  const id = params.id;

  const result = await readValidatedBody(event, BodySchema.safeParse);

  const { filters = [], pagination } = result.data || {};

  const client = await serverSupabaseClient<Database>(event);

  let query = client
    .from("vehicleservicelogs_with_items")
    .select("*")
    .eq("vehicle_id", id)
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
