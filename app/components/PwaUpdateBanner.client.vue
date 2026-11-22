<script setup lang="ts">
const { $pwa } = useNuxtApp();
const updating = ref(false);

const update = async () => {
  updating.value = true;
  await $pwa?.updateServiceWorker();
};

const later = () => {
  $pwa?.cancelPrompt();
};
</script>

<template>
  <UBanner
    icon="mdi:update"
    color="primary"
    title="A new version of Vehicle Hub is available."
    :actions="[
      {
        label: 'Update',
        color: 'neutral',
        variant: 'solid',
        size: 'xs',
        loading: updating,
        onClick: update,
      },
    ]"
    close
    @close="later"
    :ui="{ root: 'pt-[env(safe-area-inset-top)]' }"
  />
</template>
