import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  shareId: z.coerce.number().int().positive(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, shareId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleShares")
    .delete()
    .eq("vehicle_id", vehicleId)
    .eq("id", shareId);

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
