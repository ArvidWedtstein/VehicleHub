import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import { z } from "zod";

function assertNoError(
  error: unknown,
  status: number,
  statusText: string,
): asserts error is null {
  if (error)
    throw createError({ statusCode: status, statusText, ...(error as object) });
}

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

const itemSchema = z.object({
  id: z.number().optional(),
  created_at: z.string().optional(),
  service_log_id: z.number().optional(), // will be overwritten anyway
  description: z.string().min(1).default(""),
  cost: z.number(),
  quantity: z.number().default(1),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  service: serviceSchema,
  items: z.array(itemSchema).optional().default([]),
  removedItemIds: z
    .array(z.object({ id: z.coerce.number() }))
    .optional()
    .default([]),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, serviceId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const body = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleServiceLogs")
    .update(body.service)
    .eq("id", serviceId)
    .eq("vehicle_id", vehicleId)
    .select()
    .single();

  assertNoError(error, status, statusText);

  await Promise.all([
    body.removedItemIds.length > 0
      ? client
          .from("VehicleServiceLogsItems")
          .delete()
          .eq("service_log_id", serviceId)
          .in(
            "id",
            body.removedItemIds.map((row) => row.id),
          )
      : Promise.resolve(),
    body.items.length > 0
      ? client.from("VehicleServiceLogsItems").upsert(
          body.items.map((item) => ({
            ...item,
            service_log_id: serviceId,
          })),
        )
      : Promise.resolve(),
  ]);

  const [items, files] = await Promise.all([
    client
      .from("VehicleServiceLogsItems")
      .select()
      .eq("service_log_id", serviceId),
    client.from("VehicleDocuments").select().eq("service_log_id", serviceId),
  ]);
  assertNoError(items.error, items.status, items.statusText);
  assertNoError(files.error, files.status, files.statusText);

  const totalCost = items?.data.reduce(
    (sum, item) => sum + (item.cost || 0) * (item.quantity || 0),
    0,
  );

  return {
    ...data,
    totalCost: totalCost || 0,
    items: items.data,
    files: files.data,
  };
});
