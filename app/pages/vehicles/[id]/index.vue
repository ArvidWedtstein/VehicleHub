<script setup lang="ts">
definePageMeta({
  layout: "vehicle",
  //redirect: (route) => `/vehicles/${route.params.id}/expenses`,
});
</script>
<template>
  <UPage class="flex-1 min-h-0">
    <VehicleCard />
  </UPage>
</template>
