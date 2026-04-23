import { serverSupabaseClient } from "#supabase/server";
import { Database, Tables } from "~/types/supabase";

type FilterBody = {
  filters?: FilterOption<Tables<"vehicleservicelogs_with_items">>[];
  pagination?: {
    limit: number;
    offset: number;
  };
};

export default defineAuthenticatedEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  const result = await readValidatedBody<FilterBody>(event, (data) => {
    if (!data) {
      throw createError({ statusCode: 400, statusMessage: "Body required" });
    }

    if (typeof data !== "object" || data === null) {
      throw createError({ statusCode: 400 });
    }

    const b = data as Record<string, unknown>;

    if (b.filters && !Array.isArray(b.filters)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Filters should be an array",
      });
    }

    return data;
  });

  const { filters = [], pagination } = result;

  const client = await serverSupabaseClient<Database>(event);

  let query = client
    .from("vehicleservicelogs_with_items")
    .select("*")
    .eq("vehicle_id", parseInt(id))
    .order("date", { ascending: false });

  if (filters && filters.length > 0) {
    query = applyFilters<"vehicleservicelogs_with_items", typeof query>(
      query,
      filters,
    );
  }

  if (pagination) {
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
