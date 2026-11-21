import { H3Event } from "h3";
import { serverSupabaseUser } from "#supabase/server";

export type AuthenticatedEventHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  user: AppJwtPayload,
) => Promise<D> | D;

export const defineAuthenticatedEventHandler = <
  T extends EventHandlerRequest,
  D,
>(
  handler: AuthenticatedEventHandler<T, D>,
  options?: { roles?: string[]; permissions?: Permission[] },
) => {
  return defineEventHandler<T>(async (event) => {
    const user = (await serverSupabaseUser(event)) as AppJwtPayload | null;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const userRole = user.app_metadata?.role;
    const userPermissions = user?.app_metadata?.permissions || [];

    if (options?.roles?.length) {
      if (!userRole || !options.roles.includes(userRole)) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden: Insufficient role",
        });
      }
    }

    if (options?.permissions?.length) {
      const hasPermission = options.permissions.some((p) =>
        userPermissions.includes(p),
      );
      if (!hasPermission) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden: Missing permission",
        });
      }
    }

    return handler(event, user);
  });
};
