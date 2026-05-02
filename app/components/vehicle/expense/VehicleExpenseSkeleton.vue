<script setup lang="ts"></script>

<template>
  <div class="grid items-center gap-4">
    <div class="grid gap-2">
      <USkeleton class="h-4 w-32" />
      <USkeleton class="h-4 w-60" />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <USkeleton class="h-16" />
      <USkeleton class="h-16" />
      <USkeleton class="h-16" />
      <USkeleton class="h-16" />
    </div>
    <div class="grid grid-cols-2 gap-2">
      <USkeleton class="h-8" />
      <USkeleton class="h-8" />
    </div>
  </div>
</template>
