<script setup lang="ts">
import VehiclesList from "~/features/vehicles/VehiclesList.vue";

useHead({
  titleTemplate: "%s | Vehicle Hub",
});

definePageMeta({
  auth: false,
});

useSeoMeta({
  title: "Vehicles",
  ogTitle: "Vehicles",
  description: "List of vehicles owned or shared with you.",
  ogDescription: "List of vehicles owned or shared with you.",
  ogImage: "/img/StartImg.jpg",
});
</script>

<template>
  <div class="py-6 mb-12 md:mb-0 md:py-32">
    <div class="mx-auto grid max-w-7xl px-6 gap-6">
      <div class="max-w-xl">
        <h2
          class="text-pretty text-3xl font-semibold tracking-tight text-base-content sm:text-4xl"
        >
          Your Vehicles
        </h2>
        <p class="mt-3 text-lg leading-8 dark:text-gray-300 text-gray-600">
          Vehicles owned or shared with you
        </p>
      </div>

      <VehiclesList />
    </div>
  </div>
</template>
