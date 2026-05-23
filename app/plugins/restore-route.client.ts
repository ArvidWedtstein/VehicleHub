export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const STORAGE_KEY = "last_route";

  const SKIP_ROUTES = ["/login", "/callback"];

  const startTracking = () => {
    router.afterEach((to) => {
      if (!SKIP_ROUTES.some((r) => to.path.startsWith(r))) {
        localStorage.setItem(STORAGE_KEY, to.fullPath);
      }
    });
  };

  nuxtApp.hook("app:mounted", async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const current = router.currentRoute.value.fullPath;

    const isReturning = !sessionStorage.getItem("alive");
    sessionStorage.setItem("alive", "1");
    console.log("redirect", isReturning, { saved, current });

    if (isReturning && saved && saved !== current) {
      console.info("Restoring last route:", saved);
      await router.replace(saved);
    }

    startTracking();
  });
});
