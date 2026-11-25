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
  <UPageGrid :ui="{ base: 'grid-cols-1 lg:grid-cols-2 gap-2 m-2' }">
    <VehicleStatsFuelCard />

    <VehicleStatsSpendingCard />

    <USplitter
      v-if="!isMobile"
      id="stats-desktop"
      :items
      class="col-span-full"
      orientation="horizontal"
    >
      <template #expenses>
        <VehicleStatsExpensesCard />
      </template>
      <template #services>
        <VehicleStatsServicesCard />
      </template>
    </USplitter>

    <template v-else>
      <VehicleStatsExpensesCard class="col-span-full" />
      <VehicleStatsServicesCard class="col-span-full" />
    </template>
  </UPageGrid>
</template>
