import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );

  // Read multipart form
  const form = await readMultipartFormData(event);
  if (!form)
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });

  const file = form.find((f) => f.filename);
  if (!file)
    throw createError({ statusCode: 400, statusMessage: "Invalid file" });

  const supabase = await serverSupabaseClient<Database>(event);

  const filePath = `${vehicleId}/${file.filename}`;
  const { data, error } = await supabase.storage
    .from("VehicleImages")
    .upload(filePath, file.data, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw createError({ ...error, statusCode: 500 });

  return data;
});
