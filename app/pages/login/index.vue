<script setup lang="ts">
import type { Database } from "~/types/supabase";

useHead({
  title: "Login",
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
  <div class="my-2 grid grid-cols-1 gap-2">
    <button type="button" class="btn btn-accent" @click="signInWithGoogle">
      <!-- <GoogleIcon /> -->
      Sign in with Google
    </button>
  </div>
</template>
