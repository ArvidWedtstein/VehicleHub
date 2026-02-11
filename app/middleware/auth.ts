export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/login");
  }

  if (user.value && to.path === "/login") {
    return navigateTo("/"); // Or another dashboard page
  }
});
