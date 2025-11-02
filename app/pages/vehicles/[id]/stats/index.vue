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
  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
    <FuelExpenseStatCard class="md:col-span-2" />

    <ExpensesStatCard class="col-span-1" />
    <ServicesStatCard class="col-span-1" />
  </div>
</template>
