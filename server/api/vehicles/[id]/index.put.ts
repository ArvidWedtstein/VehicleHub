import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

const vehicleSchema = z.object({
  id: z.number().optional(),
  licenseplate_number: z.string().optional(),
  vehicle_identification_number: z.string().optional(),
  type: z.string().min(1).nonoptional().default("Car"),
  body_type: z.string().optional(),
  make: z
    .string()
    .optional()
    .transform((val) => val ?? undefined)
    .default(""),
  model: z
    .string()
    .optional()
    .transform((val) => val ?? undefined)
    .default(""),
  model_year: z
    .number()
    .min(1885)
    .max(new Date().getFullYear() + 10)
    .optional()
    .default(new Date().getFullYear()),

  color: z.string().optional(),
  engine_displacement: z.number().optional(),
  engine_displacement_unit: z.string().optional().default("liter"),
  drivetrain: z.string().toUpperCase().optional().default("FWD"),
  engine_cylinders: z.number().min(0).max(100).optional(),
  weight: z.number().positive().optional(),
  transmission_gears: z.number().optional(),
  transmission_type: z.string().optional().default("Automatic"),
  fuel_type: z.string().optional().default("Gasoline"),
  fuel_capacity: z.number().positive().optional().default(0),
  fuel_capacity_unit: z.string().optional().default("liter"),
  mileage_unit: z.string().optional().default("kilometer"),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  vehicle: vehicleSchema,
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { vehicle } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("Vehicles")
    .update(vehicle)
    .eq("id", vehicleId)
    .select();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
