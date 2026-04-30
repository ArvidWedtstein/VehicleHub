<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const vehicleId = useRouteParam("id", "number");

const { isMobile } = useBreakpoints();

const links = computed<NavigationMenuItem[]>(() =>
  vehicleId.value
    ? [
        {
          label: "Expenses",
          icon: "mdi:gas-station",
          to: {
            name: "vehicles-id-expenses",
            params: { id: vehicleId.value },
          },
        },
        {
          label: "Services",
          icon: "mdi:wrench",
          to: {
            name: "vehicles-id-services",
            params: { id: vehicleId.value },
          },
        },
        {
          label: "Files",
          icon: "mdi:folder",
          to: {
            name: "vehicles-id-files",
            params: { id: vehicleId.value },
          },
        },
      ]
    : [
        {
          label: "Vehicles",
          icon: "mdi:car",
          to: {
            name: "vehicles",
          },
        },
      ],
);
</script>
<template>
  <LazyUFooter
    v-if="isMobile"
    :ui="{
      left: 'hidden',
      center: 'lg:grow',
      right: 'hidden',
    }"
  >
    <UNavigationMenu
      class="fixed bottom-0 w-full"
      :ui="{
        root: 'justify-around border-t border-default py-2 w-full',
        item: 'py-0',
        link: 'flex-col gap-1 px-3',
        linkLeadingIcon: 'size-5',
        linkLabel: 'text-[10px]/3 font-normal',
      }"
      :items="links"
      orientation="horizontal"
    />
  </LazyUFooter>
</template>
