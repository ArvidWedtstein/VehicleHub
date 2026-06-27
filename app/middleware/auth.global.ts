export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();

  if (to.meta.auth === false) return;

  if (user.value === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (!user.value && to.path !== "/login") {
    return navigateTo("/login");
  }
});
