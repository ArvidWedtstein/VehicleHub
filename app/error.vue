<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});
</script>

<template>
  <div v-if="error?.error" class="hero min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">
          {{ error?.statusCode }} {{ error.name }}
        </h1>
        <p class="py-6">
          {{ error.message || "An unexpected error has occurred." }}
        </p>
        {{ error.stack }}
        <NuxtLink to="/" class="link link-primary">Go back home</NuxtLink>
      </div>
    </div>
  </div>
</template>
