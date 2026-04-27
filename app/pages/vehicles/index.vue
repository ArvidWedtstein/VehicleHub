<script setup lang="ts">
useHead({
  titleTemplate: "%s | Vehicle Hub",
});

definePageMeta({
  auth: false,
});

useSeoMeta({
  title: "Vehicles",
  ogTitle: "Vehicles",
  description: "List of vehicles owned or shared with you.",
  ogDescription: "List of vehicles owned or shared with you.",
  ogImage: "/img/StartImg.jpg",
});
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Your Vehicles"
      description="Vehicles owned or shared with you"
    />

    <UPageBody>
      <VehicleList />
    </UPageBody>
  </UContainer>
</template>
