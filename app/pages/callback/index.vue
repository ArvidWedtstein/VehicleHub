<script setup lang="ts">
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();

const router = useRouter();

definePageMeta({
  auth: false,
});

onMounted(async () => {
  console.info("LOGO9OOG");
  if (!user) {
    console.warn("No user found");
    router.push("/login");
  } else {
    const path = redirectInfo.pluck();
    console.log("Logged in user:", user);
    return navigateTo(path || "/");
  }
});
</script>
<template>Logging in..</template>
