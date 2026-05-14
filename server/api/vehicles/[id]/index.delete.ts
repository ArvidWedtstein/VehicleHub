import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

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
    .from("Vehicles")
    .delete()
    .eq("id", vehicleId);

  if (error) throw createError({ statusCode: status, statusText, ...error });
  return data;
});
