import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import type { Database } from "~/types/supabase";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const querySchema = z.object({
  serviceId: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: vehicleId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { serviceId } = await getValidatedQuery(event, querySchema.parse);

  const supabase = await serverSupabaseClient<Database>(event);

  const form = await readMultipartFormData(event);
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: "No files uploaded" });
  }

  const files = form.filter((f): f is typeof f & { filename: string } =>
    Boolean(f.filename && f.data?.length),
  );

  if (!files.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid files found",
    });
  }

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${vehicleId}/${safeFilename}`;

      const { data, error } = await supabase.storage
        .from("VehicleDocuments")
        .upload(filePath, file.data, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      return { filePath, data, error };
    }),
  );

  const failedUpload = uploadResults.find((res) => res.error);
  if (failedUpload?.error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to upload ${failedUpload.filePath}: ${failedUpload.error.message}`,
      data: failedUpload.error,
    });
  }

  // 3. Batch upsert all document records in a single DB query
  const records = uploadResults.map((res) => ({
    vehicle_id: vehicleId,
    file_path: res.filePath,
    ...(serviceId !== undefined && { service_log_id: serviceId }),
  }));

  const {
    data: documents,
    error: dbError,
    status,
    statusText,
  } = await supabase
    .from("VehicleDocuments")
    .upsert(records, { onConflict: "file_path" })
    .select();

  if (dbError) {
    throw createError({
      statusCode: status || 500,
      statusMessage: dbError.message || statusText,
      data: dbError,
    });
  }

  return {
    storage: uploadResults.map((r) => r.data),
    documents,
  };
});
