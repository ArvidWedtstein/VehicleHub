import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

const querySchema = z.object({
  code: z.string().optional(),
  next: z.url().optional(),
});

export default defineEventHandler(async (event) => {
  const { code, next } = await getValidatedQuery(event, querySchema.parse);

  if (code) {
    const client = await serverSupabaseClient(event);
    await client.auth.exchangeCodeForSession(code);
  }

  // TODO: fix redirect path cookie name
  const redirectTo = getCookie(event, "sb-redirect-path") || next || "/";
  deleteCookie(event, "sb-redirect-path");

  return sendRedirect(event, redirectTo);
});
