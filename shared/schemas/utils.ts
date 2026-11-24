import z from "zod";

export const nullish = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((v) => v ?? undefined);

export const dbToForm = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((val) => val ?? undefined);
