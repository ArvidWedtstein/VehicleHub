import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const vehicleId = getRouterParam(event, "id");
  const documentId = getRouterParam(event, "documentId");
  const body = await readBody(event);

  const { filePath } = body;

  if (!vehicleId)
    throw createError({
      statusCode: 400,
      statusMessage: "No vehicle id provided",
    });

  if (!documentId)
    throw createError({
      statusCode: 400,
      statusMessage: "No document id provided",
    });
  if (!filePath || typeof filePath != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "No document file path was provided",
    });

  if (!filePath.startsWith(vehicleId))
    throw createError({
      statusCode: 400,
      statusMessage: "Vehicle ID and filePath do not match",
    });

  const { data, error } = await client.storage
    .from("VehicleDocuments")
    .remove([filePath]);

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return data;
});
