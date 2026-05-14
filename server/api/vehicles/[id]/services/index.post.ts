import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const serviceSchema = z.object({
  id: z.number().optional(),
  vehicle_id: z.number(),
  date: z.string(),
  type: z.string().min(1).default(""),
  provider: z.string().optional(),
  mileage: z.number().optional(),
  currency: z.string().length(3).toUpperCase().default("NOK"),
  notes: z.string().optional(),
});

const bodySchema = z.object({
  service: serviceSchema,
  items: z.array(z.record(z.string(), z.unknown())).optional().default([]), // TODO: fix
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const body = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleServiceLogs")
    .insert(body.service)
    .eq("vehicle_id", vehicleId)
    .select("id")
    .single();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  if (body.items && body.items?.length > 0) {
    const itemsToInsert = body.items?.map((item) => ({
      ...item,
      service_log_id: data.id,
    }));

    const { error: itemsError } = await client
      .from("VehicleServiceLogsItems")
      .insert(itemsToInsert);

    if (itemsError)
      throw createError({ statusCode: 500, statusMessage: itemsError.message });
  }

  return data;
});
