import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  event.context.user = user;

  if (event.path.startsWith("/vehicles")) {
    if (!user) {
      await sendRedirect(event, "/", 302);
    }
  }
});
