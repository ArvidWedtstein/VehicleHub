export default defineNuxtRouteMiddleware((to) => {
  const { lastVehicleId } = useLastVehicle();

  if (to.path === "/" && lastVehicleId.value) {
    return navigateTo(`/vehicles/${lastVehicleId.value}/expenses`);
  }
});
