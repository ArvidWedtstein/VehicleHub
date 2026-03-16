import { H3Event, H3EventContext } from "h3";
import type { User } from "@supabase/supabase-js";

type AuthenticatedEvent = H3Event & {
  context: H3EventContext & {
    user: User;
  };
};

export const defineAuthenticatedEventHandler = <T>(
  handler: (event: AuthenticatedEvent) => T,
) => {
  return defineEventHandler(async (event) => {
    if (!event.context.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    return handler(event as AuthenticatedEvent);
  });
};
