import z from "zod";

export const nullish = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((v) => v ?? undefined);

export const dbToForm = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((val) => val ?? undefined);

export const currency = z
  .string()
  .regex(/^[A-Za-z]{3}$/, "Must be a 3-letter currency code")
  .transform((s) => s.toUpperCase());
