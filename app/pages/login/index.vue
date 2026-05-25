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
const redirect = (url: string) => {
  console.log("Redirecting to:", url);
};

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) console.error("Login error:", error);
};

const providers = [
  {
    label: "Google",
    icon: "mdi:google",
    onClick: signInWithGoogle,
  },
];
</script>

<template>
  <UAuthForm
    title="Login"
    icon="mdi:lock"
    :providers="providers"
    description="Login to access your vehicle dashboard, manage your fleet, and stay on top of your vehicle's maintenance with ease."
  >
    <template #password-hint>
      <ULink to="#" class="text-primary font-medium" tabindex="-1"
        >Forgot password?</ULink
      >
    </template>
    <template #validation>
      <UAlert color="error" icon="i-lucide-info" title="Error signing in" />
    </template>
    <template #footer>
      By signing in, you agree to our
      <ULink to="/tos" class="text-primary font-medium">Terms of Service</ULink>
    </template>
  </UAuthForm>
</template>
