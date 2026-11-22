<script setup lang="ts">
import type { SplitterItem } from "@nuxt/ui";

useHead({
  title: "Stats",
});
definePageMeta({
  auth: true,
});

const { isMobile } = useBreakpoints();

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
  <UPageGrid :ui="{ base: 'grid-cols-1 gap-2 m-2' }">
    <VehicleExpenseFuelStatCard class="col-span-full" />

    <USplitter
      v-if="!isMobile"
      id="stats-desktop"
      :items
      class="col-span-full"
      orientation="horizontal"
    >
      <template #expenses>
        <VehicleExpenseStatCard />
      </template>
      <template #services>
        <VehicleServiceStatCard />
      </template>
    </USplitter>

    <template v-else>
      <VehicleExpenseStatCard class="col-span-full" />
      <VehicleServiceStatCard class="col-span-full" />
    </template>
  </UPageGrid>
</template>
