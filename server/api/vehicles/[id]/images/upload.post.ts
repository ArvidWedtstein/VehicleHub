import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const { id: vehicleId } = event.context.params as {
    id: string;
  };

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  // Read multipart form
  const form = await readMultipartFormData(event);
  if (!form)
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });

  const file = form.find((f) => f.filename);
  if (!file)
    throw createError({ statusCode: 400, statusMessage: "Invalid file" });

  const filePath = `${vehicleId}/${file.filename}`;
  const { data, error } = await supabase.storage
    .from("VehicleImages")
    .upload(filePath, file.data, {
      contentType: file.type,
      upsert: true,
    });

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
