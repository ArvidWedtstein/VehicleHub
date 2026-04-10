<script setup lang="ts">
import ExpensesStatCard from "~/features/vehicles/stats/ExpensesStatCard.vue";
import FuelExpenseStatCard from "~/features/vehicles/stats/FuelExpenseStatCard.vue";
import ServicesStatCard from "~/features/vehicles/stats/ServicesStatCard.vue";

useHead({
  title: "Stats",
});
definePageMeta({
  middleware: "auth",
  layout: "vehicle",
});
</script>

<template>
  <UPageGrid :ui="{ base: 'lg:grid-cols-2' }">
    <FuelExpenseStatCard class="md:col-span-2" />
    <ExpensesStatCard />
    <ServicesStatCard />
  </UPageGrid>
</template>
