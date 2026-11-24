import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/supabase";
import z from "zod";

const profileSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  created_at: z.iso.datetime().optional(),
  name: z.string().optional(),
  role_id: z.coerce.number().optional(),
  user_id: z.uuid().optional(),
  currency: z.currencyCode().optional(),
  profile_image_url: z
    .string()
    .min(1)
    .refine((p) => !p.includes(".."), {
      message: "Path traversal not allowed",
    })
    .optional(),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive().or(z.coerce.string()),
});

const bodySchema = z.object({
  profile: profileSchema,
});

export default defineAuthenticatedEventHandler(async (event) => {
  const { id: profileId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { profile } = await readValidatedBody(event, bodySchema.parse);

  const client = await serverSupabaseClient<Database>(event);

  const query = client.from("Profiles").update(profile).select();

  if (typeof profileId === "string") {
    query.eq("user_id", profileId);
  } else {
    query.eq("id", profileId);
  }

  const { data, error, status, statusText } = await query;

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
