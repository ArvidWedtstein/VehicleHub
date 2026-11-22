<script setup lang="ts">
import { en_gb } from "@nuxt/ui/locale";

const { $pwa } = useNuxtApp();
</script>

<template>
  <UApp :locale="en_gb">
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />

    <LazyPwaUpdateBanner v-if="$pwa?.needRefresh" />

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
