<script setup lang="ts">
import type { SplitterItem } from "@nuxt/ui";

useHead({
  title: "Stats",
});
definePageMeta({
  auth: true,
});

const items: SplitterItem[] = [
  {
    slot: "expenses",
    minSize: 20,
    defaultSize: 50,
    class: "items-center justify-center",
  },
  {
    slot: "services",
    minSize: 20,
    defaultSize: 50,
    class: "items-center justify-center",
  },
];
</script>

<template>
  <UPageGrid :ui="{ base: 'lg:grid-cols-2 gap-2' }">
    <VehicleExpenseFuelStatCard class="md:col-span-2" />

    <USplitter id="stats" :items class="md:col-span-2">
      <template #expenses>
        <VehicleExpenseStatCard />
      </template>
      <template #services>
        <VehicleServiceStatCard />
      </template>
    </USplitter>
  </UPageGrid>
</template>
