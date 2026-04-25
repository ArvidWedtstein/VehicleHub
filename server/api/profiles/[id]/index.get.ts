import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const id = getRouterParam(event, "id");
  if (!id)
    throw createError({
      statusCode: 400,
      statusMessage: "No profile id provided",
    });

  const query = client.from("Profiles").select("*");

  if (Number.isInteger(parseInt(id))) {
    query.eq("id", parseInt(id));
  } else {
    query.eq("user_id", id);
  }

  const { data, error } = await query.single();

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
});
