import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineAuthenticatedEventHandler(async (event) => {
  const body = await readBody(event);
  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({ statusCode: 400, statusMessage: "No id provided" });

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("Vehicles")
    .update(body)
    .eq("id", parseInt(id))
    .select();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
