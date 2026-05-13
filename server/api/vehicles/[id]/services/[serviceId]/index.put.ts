import { serverSupabaseClient } from "#supabase/server";
import { Database, TablesUpdate } from "~/types/supabase";
import { z } from "zod";

const serviceSchema = z.object({
  id: z.number().optional(),
  vehicle_id: z.number().optional(),
  date: z.string(),
  type: z.string().min(1).default(""),
  provider: z.string().optional(),
  mileage: z.number().optional(),
  currency: z.string().length(3).toUpperCase().default("NOK"),
  notes: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  service: serviceSchema,
  items: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  removedItemIds: z
    .array(z.object({ id: z.coerce.number() }))
    .optional()
    .default([]),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const params = paramsSchema.safeParse(event.context.params);
  if (!params.success) {
    throw createError({
      statusCode: 400,
      statusMessage: params.error.issues[0]?.message ?? "Invalid params",
    });
  }

  const { id: vehicleId, serviceId } = params.data;

  const body = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleServiceLogs")
    .update(body.service)
    .eq("id", serviceId)
    .eq("vehicle_id", vehicleId)
    .select()
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  if (body.removedItemIds.length > 0) {
    const { error: deleteError } = await client
      .from("VehicleServiceLogsItems")
      .delete()
      .eq("service_log_id", serviceId)
      .in(
        "id",
        body.removedItemIds.map((row) => row.id),
      );

    if (deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: deleteError.message,
      });
  }

  if (body.items && body.items.length > 0) {
    const { error: itemsError } = await client
      .from("VehicleServiceLogsItems")
      .upsert(
        body.items.map((item) => ({
          ...item,
          service_log_id: serviceId,
        })),
      );

    if (itemsError)
      throw createError({ statusCode: 500, statusMessage: itemsError.message });
  }

  return data;
});
