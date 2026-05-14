import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  ids: z.array(z.number().int().positive()).default([]),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const { ids } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleShares")
    .delete()
    .in("id", ids)
    .eq("vehicle_id", vehicleId);

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
