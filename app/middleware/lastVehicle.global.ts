export default defineNuxtRouteMiddleware((to, from) => {
  try {
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
        "Redirecting to last vehicle's page:",
        from.path,
        lastVehicleId.value,
      );
      //return navigateTo(redirectPath);
    }
  } catch (error) {
    console.error("Error in lastVehicle middleware:", error);
  }
});
