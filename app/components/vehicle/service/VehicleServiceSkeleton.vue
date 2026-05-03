<script setup lang="ts"></script>

<template>
  <div class="grid items-center gap-4">
    <div class="grid gap-2">
      <USkeleton class="h-4 w-32" />
      <USkeleton class="h-4 w-60" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      <USkeleton class="h-14" />
      <USkeleton class="h-14" />
      <USkeleton class="h-14" />
    </div>

    <USkeleton class="h-4 w-60" />

    <div class="grid gap-1">
      <USkeleton class="h-2 w-50" />
      <USkeleton class="h-2 w-50" />
      <USkeleton class="h-2 w-50" />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <USkeleton class="h-8" />
      <USkeleton class="h-8" />
    </div>
  </div>
</template>
