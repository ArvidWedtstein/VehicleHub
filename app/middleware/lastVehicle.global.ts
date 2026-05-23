export default defineNuxtRouteMiddleware((to, from) => {
  try {
    const user = useSupabaseUser();
    const { lastVehicleId } = useLastVehicle();

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
      //xxreturn navigateTo(redirectPath);
    }
  } catch (error) {
    console.error("Error in lastVehicle middleware:", error);
  }
});
