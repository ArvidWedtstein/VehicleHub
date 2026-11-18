import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import { serverSupabaseUser } from "#supabase/server";

type NitroCacheOptions<D = any> = NonNullable<
  Parameters<typeof defineCachedEventHandler<EventHandlerRequest, D>>[1]
>;

type AuthenticatedCachedHandler<T extends EventHandlerRequest, D> = (
  event: H3Event<T>,
  user: AppJwtPayload,
) => D;

export interface AuthenticatedCacheOptions<
  T extends EventHandlerRequest,
  D = any,
> extends Omit<NitroCacheOptions<D>, "getKey"> {
  roles?: string[];
  permissions?: Permission[];
  requireAllPermissions?: boolean;
  getKey?: (event: H3Event<T>, user: AppJwtPayload) => string;
}

export const defineAuthenticatedCachedEventHandler = <
  T extends EventHandlerRequest = EventHandlerRequest,
  D = unknown,
>(
  handler: AuthenticatedCachedHandler<T, D>,
  options: AuthenticatedCacheOptions<T, Awaited<D>> = {},
): EventHandler<Omit<T, "body">, Awaited<D>> => {
  const {
    roles,
    permissions,
    requireAllPermissions,
    getKey,
    ...nitroCacheOptions
  } = options;

  const cachedHandler = defineCachedEventHandler(
    async (event: H3Event<T>) => {
      const user = event.context._authUser as AppJwtPayload;
      return await handler(event, user);
    },
    {
      ...nitroCacheOptions,
      getKey: (event: H3Event<T>) => {
        const user = event.context._authUser as AppJwtPayload;
        const customKey = getKey ? getKey(event, user) : event.path;
        return `user:${user.sub}:${customKey}`;
      },
    },
  );

  return defineEventHandler<Omit<T, "body">>(async (event) => {
    const user = (await serverSupabaseUser(event)) as AppJwtPayload | null;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const userRole = user.app_metadata?.role;
    const userPermissions = user.app_metadata?.permissions || [];

    if (roles?.length) {
      if (!userRole || !roles.includes(userRole)) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden: Insufficient role",
        });
      }
    }

    if (permissions?.length) {
      const hasPermission = requireAllPermissions
        ? permissions.every((perm) => userPermissions.includes(perm))
        : permissions.some((perm) => userPermissions.includes(perm));

      if (!hasPermission) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden: Missing permission",
        });
      }
    }

    event.context._authUser = user;
    return cachedHandler(event);
  });
};
