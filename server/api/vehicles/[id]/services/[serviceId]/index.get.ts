import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, serviceId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const client = await serverSupabaseClient<Database>(event);

  const { data: service, error } = await client
    .from("VehicleServiceLogs")
    .select(
      `
      *,
      items:VehicleServiceLogsItems (*),
      files:VehicleDocuments (*)
    `,
    )
    .eq("vehicle_id", vehicleId)
    .eq("id", serviceId)
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  const totalCost = service?.items.reduce(
    (sum, item) => sum + (item.cost || 0) * (item.quantity || 0),
    0,
  );
  return {
    ...service,
    totalCost: totalCost || 0,
  };
});
