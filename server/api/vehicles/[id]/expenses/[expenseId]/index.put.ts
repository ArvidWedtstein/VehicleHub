import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

const expenseSchema = z.object({
  id: z.number().optional(),
  vehicle_id: z.number().optional(),
  date: z.string(),
  type: z.string().default("Fuel"),
  unit: z.string().default("liter"),
  amount: z
    .number({ error: "Amount is required" })
    .min(0, "Amount cannot be less than 0")
    .default(0),
  cost: z.number({ error: "Cost is required" }).default(0),
  mileage: z.number().optional(),
  currency: z.string().length(3).toUpperCase().default("NOK"),
  notes: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  expenseId: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  expense: expenseSchema,
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
