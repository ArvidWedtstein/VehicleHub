import type { TablesInsert } from "~/types/supabase";
import * as z from "zod";
import { convertToDatetimeLocal } from "../utils/convert";

export const expenseFormSchema = z.object({
  id: z.number().optional(),
  vehicle_id: z.number().nonoptional(),
  date: z.string().default(convertToDatetimeLocal()),
  type: z.string().default("Fuel"),
  unit: z.string().default("liter"),
  amount: z.number({ error: "Amount is required" }).positive().default(0),
  cost: z.number({ error: "Cost is required" }).positive().default(0),
  mileage: z.number().positive().optional(),
  currency: z.string().length(3).toUpperCase().default("NOK"),
  notes: z.string().optional(),
}) satisfies z.ZodType<TablesInsert<"VehicleExpenses">>;
