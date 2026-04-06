<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "vehicle",
  redirect: "/vehicles/:id/expenses",
});
</script>
<template>
  <div></div>
</template>
