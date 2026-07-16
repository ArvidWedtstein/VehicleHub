import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";
import { expenseFormSchema } from "~~/shared/schemas/expense";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  expenseId: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  expense: expenseFormSchema,
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, expenseId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const { expense } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("VehicleExpenses")
    .update(expense)
    .eq("id", expenseId)
    .eq("vehicle_id", vehicleId)
    .select()
    .single();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
