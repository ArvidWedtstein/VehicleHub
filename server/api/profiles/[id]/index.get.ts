import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive().or(z.coerce.string()),
});

export default defineEventHandler(async (event) => {
  const { id: profileId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const client = await serverSupabaseClient<Database>(event);

  const query = client.from("Profiles").select("*").limit(1);

  if (typeof profileId === "string") {
    query.eq("user_id", profileId);
  } else {
    query.eq("id", profileId);
  }

  const { data, error, status, statusText } = await query.single();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
