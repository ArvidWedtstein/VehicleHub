<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "vehicle",
  redirect: (route) => `/vehicles/${route.params.id}/expenses`,
});
</script>
<template>
  <div></div>
</template>
