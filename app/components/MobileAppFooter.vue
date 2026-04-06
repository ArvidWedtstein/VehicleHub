<script setup lang="ts">
const vehicleId = useRouteParam("id", "number");
</script>
<template>
  <div class="dock dock-md flex md:hidden bg-base-300 z-10">
    <template v-if="vehicleId">
      <NuxtLink
        :to="{
          name: 'vehicles-id-expenses',
        }"
        activeClass="dock-active text-primary"
      >
        <Icon name="mdi:gas-station" size="1.2em" />
        <span class="dock-label">Expenses</span>
      </NuxtLink>

      <NuxtLink
        :to="{
          name: 'vehicles-id-services',
        }"
        activeClass="dock-active text-primary"
      >
        <Icon name="mdi:wrench" size="1.2em" />
        <span class="dock-label">Services</span>
      </NuxtLink>

      <NuxtLink
        :to="{
          name: 'vehicles-id-files',
        }"
        activeClass="dock-active text-primary"
      >
        <Icon name="mdi:folder" size="1.2em" />
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
        <Icon name="mdi:car" size="1.2em" />
        <span class="dock-label">Vehicles</span>
      </NuxtLink>
    </template>
    <!-- <RouterLink
      v-for="route in navbarRoutes"
      :key="route.name"
      :to="route.path"
      class="capitalize"
      :class="{
        'text-base-content': router.currentRoute.value.name !== route.name,
      }"
      activeClass="text-primary dock-active"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        v-if="route.meta.iconPath"
        class="size-[1.2em] fill-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="route.meta.iconPath.toString() || ''"
        />
      </svg>
      <span class="btm-nav-label">{{ route.name }}</span>
    </RouterLink> -->
  </div>
</template>
