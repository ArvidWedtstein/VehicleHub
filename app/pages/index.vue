<script setup lang="ts">
import HomeCallToAction from "~/features/home/HomeCallToAction.vue";

useHead({
  title: "Vehicle Hub",
});
definePageMeta({
  layout: "default",
  scrollToTop: true,
});
</script>
<template>
  <div>
    <HomeCallToAction />
  </div>
</template>
