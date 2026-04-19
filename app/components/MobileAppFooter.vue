<script setup lang="ts">
const vehicleId = useRouteParam("id", "number");
</script>
<template>
  <div class="dock dock-md flex md:hidden bg-base-300 z-10">
    <template v-if="vehicleId">
      <NuxtLink
        :to="{
          name: 'vehicles-id-expenses',
          params: { id: vehicleId },
        }"
        activeClass="dock-active text-primary"
      >
        <UIcon name="mdi:gas-station" />
        <span class="dock-label">Expenses</span>
      </NuxtLink>

      <NuxtLink
        :to="{
          name: 'vehicles-id-services',
          params: { id: vehicleId },
        }"
        activeClass="dock-active text-primary"
      >
        <UIcon name="mdi:wrench" />
        <span class="dock-label">Services</span>
      </NuxtLink>

      <NuxtLink
        :to="{
          name: 'vehicles-id-files',
          params: { id: vehicleId },
        }"
        activeClass="dock-active text-primary"
      >
        <UIcon name="mdi:folder" />
        <span class="dock-label">Files</span>
      </NuxtLink>
    </template>

    <template v-else>
      <NuxtLink
        :to="{
          name: 'vehicles',
        }"
        activeClass="dock-active"
      >
        <UIcon name="mdi:car" />
        <span class="dock-label">Vehicles</span>
      </NuxtLink>
    </template>
  </div>
</template>
