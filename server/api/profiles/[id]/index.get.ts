import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/supabase";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
  const { id: profileId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const client = await serverSupabaseClient<Database>(event);

  const { data, error, status, statusText } = await client
    .from("Profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
