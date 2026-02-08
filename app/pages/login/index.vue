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
  <div class="hero bg-base-200 min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">Login now!</h1>
        <p class="py-6">
          Login to access your vehicle dashboard, manage your fleet, and stay on
          top of your vehicle's maintenance with ease.
        </p>
      </div>
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <button
            type="button"
            class="btn btn-accent"
            @click="signInWithGoogle"
          >
            <!-- <GoogleIcon /> -->
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
