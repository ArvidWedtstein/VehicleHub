<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

useHead({
  title: "Vehicle Hub",
});
definePageMeta({
  scrollToTop: true,
  auth: false,
});

const links = ref<ButtonProps[]>([
  {
    label: "Get started",
    to: "/vehicles",
  },
]);
</script>
<template>
  <UPageCTA
    title="Welcome"
    description="Manage your vehicles, track expenses and services, and stay on top of maintenance with ease. Welcome to your personal Vehicle Hub."
    orientation="horizontal"
    :links="links"
    variant="naked"
  >
    <img
      src="/img/StartImg.jpg"
      alt="Illustration of a car, representing vehicle management and maintenance."
      width="500"
      height="500"
      class="w-full rounded-lg"
      loading="lazy"
    />
  </UPageCTA>
</template>
