import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/supabase";

const expenseSchema = z.object({
  id: z.number().optional(),
  vehicle_id: z.number(),
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

const bodySchema = z.object({
  expense: expenseSchema,
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  const { expense } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("VehicleExpenses")
    .insert(expense)
    .eq("vehicle_id", vehicleId)
    .single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
