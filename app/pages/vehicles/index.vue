<script setup lang="ts">
import { useVehicles } from "~/features/vehicles/useVehicles";
import VehiclesList from "~/features/vehicles/VehiclesList.vue";

definePageMeta({
  middleware: "auth",
  layout: "default",
});

const { data: vehicles } = await useVehicles();
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

      <VehiclesList :key="vehicles?.length" :vehicles="vehicles || []" />
    </div>
  </div>
</template>
