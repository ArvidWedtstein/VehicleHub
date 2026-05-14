import { serverSupabaseClient } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/supabase";

const profileSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  created_at: z.string().optional(),
  name: z.string().optional(),
  role_id: z.coerce.number().optional(),
  user_id: z.string().optional(),
  profile_image_url: z
    .string()
    .min(1)
    .refine((p) => !p.includes(".."), {
      message: "Path traversal not allowed",
    })
    .optional(),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
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

  const { data, error, status, statusText } = await client
    .from("Profiles")
    .update(profile)
    .eq("id", profileId)
    .select();

  if (error) throw createError({ statusCode: status, statusText, ...error });

  return data;
});
