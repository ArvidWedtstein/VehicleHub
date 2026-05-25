<script setup lang="ts">
import { en_gb } from "@nuxt/ui/locale";
</script>

<template>
  <UApp :locale="en_gb">
    <NuxtLoadingIndicator />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <USeparator type="dashed" class="h-px" />

    <AppFooter />
  </UApp>
</template>
