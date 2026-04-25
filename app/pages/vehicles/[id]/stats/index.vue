<script setup lang="ts">
useHead({
  title: "Stats",
});
definePageMeta({
  auth: true,
  layout: "vehicle",
});
</script>

<template>
  <UPageGrid :ui="{ base: 'lg:grid-cols-2' }">
    <VehicleExpenseFuelStatCard class="md:col-span-2" />
    <VehicleExpenseStatCard />
    <VehicleServiceStatCard />
  </UPageGrid>
</template>
