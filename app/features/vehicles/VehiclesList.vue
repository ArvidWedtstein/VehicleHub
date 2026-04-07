<script setup lang="ts">
import VehicleListItem from "./VehicleListItem.vue";
import { useVehicles } from "~/features/vehicles/useVehicles";

preloadRouteComponents({
  name: "vehicles-id-expenses",
  params: { id: "placeholder" },
});

const { data: vehicles, pending } = await useVehicles();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- <NewVehicleCard key="new-vehicle" /> -->

    <span v-if="pending">Loading...</span>
    <span v-if="vehicles && vehicles.length === 0">No vehicles</span>
    <VehicleListItem
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      :vehicle="vehicle"
    />
  </div>
</template>
