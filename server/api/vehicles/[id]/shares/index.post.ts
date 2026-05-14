import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import { Database, TablesInsert } from "~/types/supabase";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const shareSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  createdby_id: z.string().optional(),
  readonly: z.boolean().optional().default(true),
  user_id: z.string(),
  vehicle_id: z.number().positive(),
});

const bodySchema = z.object({
  shares: z.array(shareSchema),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { shares } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleShares")
    .insert(shares)
    .eq("vehicle_id", vehicleId)
    .select("*");

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
