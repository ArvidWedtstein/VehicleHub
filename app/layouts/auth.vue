<script setup lang="ts"></script>
<template>
  <UContainer class="flex items-center justify-center py-2">
    <UButton
      icon="mdi:chevron-left"
      to="/"
      size="xl"
      color="neutral"
      variant="subtle"
      class="absolute left-8 top-20 rounded-full z-10"
    />

    <UPageCard variant="subtle" class="max-w-sm w-full">
      <slot />
    </UPageCard>
  </UContainer>
</template>
