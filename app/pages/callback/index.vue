<script setup lang="ts">
import type { Database } from "#build/types/supabase-database";

const supabase = useSupabaseClient<Database>();

const router = useRouter();

onMounted(async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.info("LOGO9OOG");
  if (error) {
    console.error("Callback error:", error);
    router.push("/login");
  } else if (!user) {
    console.warn("No user found");
    router.push("/login");
  } else {
    console.log("Logged in user:", user);
    router.push("/"); // redirect to dashboard/home
  }
});
</script>
<template>Logging in..</template>
