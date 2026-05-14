import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import type { Database } from "~/types/supabase";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  documentId: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  filePath: z
    .string()
    .min(1)
    .refine((p) => !p.includes(".."), {
      message: "Path traversal not allowed",
    }),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId, documentId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { filePath } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  if (!filePath.startsWith(vehicleId.toString()))
    throw createError({
      statusCode: 400,
      statusMessage: "Vehicle ID and filePath do not match",
    });

  const { data, error } = await client.storage
    .from("VehicleDocuments")
    .remove([filePath]);

  if (error) throw createError({ ...error, statusCode: 500 });

  return data;
});
