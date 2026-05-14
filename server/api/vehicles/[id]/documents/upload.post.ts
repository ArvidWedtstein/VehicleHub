import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import type { Database } from "~/types/supabase";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const querySchema = z.object({
  serviceId: z.coerce.number().int().positive().optional(),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { serviceId } = await getValidatedQuery(event, querySchema.parse);

  const supabase = await serverSupabaseClient<Database>(event);

  const form = await readMultipartFormData(event);
  if (!form)
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });

  const file = form.find((f) => f.filename);
  if (!file)
    throw createError({ statusCode: 400, statusMessage: "Invalid file" });

  const filePath = `${vehicleId}/${file.filename}`;
  const { data, error } = await supabase.storage
    .from("VehicleDocuments")
    .upload(filePath, file.data, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw createError({ ...error, statusCode: 500 });

  if (serviceId) {
    const { error, status, statusText } = await supabase
      .from("VehicleDocuments")
      .update({
        service_log_id: serviceId,
      })
      .eq("file_path", filePath)
      .select();

    if (error) throw createError({ statusCode: status, statusText, ...error });
  }

  return data;
});
