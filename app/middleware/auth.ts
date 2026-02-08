export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();

  console.log("to", to);

  if (!user.value) {
    return navigateTo("/login");
  }

  if (user.value && to.path === "/login") {
    return navigateTo("/"); // Or another dashboard page
  }
});
