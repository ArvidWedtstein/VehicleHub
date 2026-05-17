import z from "zod";
import { parseAbsolute, getLocalTimeZone } from "@internationalized/date";

export const nullish = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullish().transform((v) => v ?? undefined);
