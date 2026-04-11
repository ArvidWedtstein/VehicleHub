<script setup lang="ts">
import type { Database } from "~/types/supabase";

useHead({
  title: "Login",
});

definePageMeta({
  layout: "auth",
  auth: false,
});

const supabase = useSupabaseClient<Database>();

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (error) console.error("Login error:", error);
  console.log("ssss", data);
};
</script>

<template>
  <UPageHero
    title="Login Now!"
    description="Login to access your vehicle dashboard, manage your fleet, and stay on top of your vehicle's maintenance with ease."
    :links="[
      {
        label: 'Sign in with Google',
        icon: 'mdi:google',
        onClick: signInWithGoogle,
      },
    ]"
  />
</template>
