<script setup lang="ts">
const user = useSupabaseUser();
const redirectInfo = useSupabaseCookieRedirect();

const router = useRouter();

definePageMeta({
  auth: false,
});

onMounted(async () => {
  console.info("LOGO9OOG");
  if (!user.value) {
    console.warn("No user found");
    router.push("/login");
  }
});

watch(
  user,
  () => {
    if (user.value) {
      const path = redirectInfo.pluck();

      console.log("user found", path);

      return navigateTo(path || "/");
    }
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <UContainer>
    <UPage>
      <UPageHeader title="Logging you in..." />
    </UPage>
  </UContainer>
</template>
