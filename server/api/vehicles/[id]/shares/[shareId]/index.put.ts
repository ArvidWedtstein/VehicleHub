import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  shareId: z.coerce.number().int().positive(),
});

const shareSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  createdby_id: z.string().optional(),
  readonly: z.boolean().optional().default(true),
  user_id: z.string().optional(),
  vehicle_id: z.number().positive(),
});

const bodySchema = z.object({
  share: shareSchema,
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, shareId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { share } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleShares")
    .update(share)
    .eq("id", shareId)
    .eq("vehicle_id", vehicleId)
    .select();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
