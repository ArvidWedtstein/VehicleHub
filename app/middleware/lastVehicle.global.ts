export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();
  const { lastVehicleId } = useLastVehicle();

  // TODO: use useSupabaseCookieRedirect instead?

  const redirectPath = `/vehicles/${lastVehicleId.value}/expenses`;

  if (!user.value) {
    return;
  }

  // TODO: find a solution for this. Only do this first time
  if (to.path === "/" && from.path !== redirectPath && lastVehicleId.value) {
    console.log(
      "Redirecting to last vehicle's expenses page:",
      from.path,
      lastVehicleId.value,
    );
    //return navigateTo(redirectPath);
  }
});
