import { H3Event, H3EventContext } from "h3";
import type { User } from "@supabase/supabase-js";
import { serverSupabaseUser } from "#supabase/server";

type AuthenticatedEvent = H3Event & {
  context: H3EventContext & {
    user: User;
  };
};

export const defineAuthenticatedEventHandler = <T>(
  handler: (event: AuthenticatedEvent) => T,
) => {
  return defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    return handler(event as AuthenticatedEvent);
  });
};
