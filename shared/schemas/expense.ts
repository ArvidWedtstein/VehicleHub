import * as z from "zod";
import { convertToDatetimeLocal } from "../utils/convert";
import { dbToForm } from "./utils";

export const expenseFormSchema = z.object({
  id: z.number().optional(),
  date: z.string().default(convertToDatetimeLocal()),
  type: z.string().optional(),
  unit: z.string().default("liter"),
  amount: z.number().min(0).default(0),
  cost: z.number({ error: "Cost is required" }).min(0).default(0),
  mileage: z.number().min(0).default(0),
  currency: z.currencyCode().default("NOK"),
  notes: dbToForm(z.string().optional()),
  location: dbToForm(z.string().optional()),
});

export const expenseInsertSchema = expenseFormSchema.extend({
  vehicle_id: z.number(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location_accuracy: z.number().optional(),
  location: z.string().optional(),
});
