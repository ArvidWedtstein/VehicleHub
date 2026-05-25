<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items: NavigationMenuItem[] = [
  {
    label: "Privacy Policy",
    to: "/policy",
    target: "_blank",
  },
  {
    label: "Terms of Service",
    to: "/tos",
    target: "_blank",
  },
];

const { isMobile } = useBreakpoints();
</script>

<template>
  <UFooter v-if="!isMobile">
    <template #left>
      <p class="text-muted text-sm">
        Copyright © {{ new Date().getFullYear() }}
      </p>
    </template>

    <UNavigationMenu :items="items" variant="link" />
  </UFooter>
</template>
