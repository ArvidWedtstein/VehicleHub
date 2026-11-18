export const usePermission = () => {
  const user = useSupabaseUser() as Ref<AppJwtPayload | null>;

  const roleId = computed<number | null>(() => {
    return user.value?.role_id ?? null;
  });

  const role = computed<string | null>(() => {
    return user.value?.app_metadata?.role ?? null;
  });

  const permissions = computed<Permission[]>(() => {
    return user.value?.app_metadata?.permissions ?? [];
  });

  const can = (permission: Permission): boolean => {
    return permissions.value.includes(permission);
  };

  /**
   * Check if the user has at least one of the listed permissions
   */
  const canAny = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some((perm) => permissions.value.includes(perm));
  };

  /**
   * Check if the user has all of the listed permissions
   */
  const canAll = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every((perm) =>
      permissions.value.includes(perm),
    );
  };

  const hasRole = (allowedRoles: string | string[]): boolean => {
    if (!role.value) return false;
    const list = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return list.includes(role.value);
  };

  return {
    roleId,
    role,
    permissions,
    can,
    canAny,
    canAll,
    hasRole,
  };
};
