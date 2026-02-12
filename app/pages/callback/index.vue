<script setup lang="ts">
import type { Database } from "#build/types/supabase-database";

const supabase = useSupabaseClient<Database>();

const router = useRouter();

onMounted(async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.info("LOGO9OOG");
  if (error) {
    console.error("Callback error:", error);
    router.push("/login");
  } else if (!session) {
    console.warn("No session found");
    router.push("/login");
  } else {
    console.log("Logged in user:", session.user);
    router.push("/"); // redirect to dashboard/home
  }
});
</script>
<template>Logging in..</template>
