import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/supabase";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("changelog_with_profile")
    .select("*")
    .order("created_at", { ascending: false })
    .eq("vehicle_id", vehicleId);

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
