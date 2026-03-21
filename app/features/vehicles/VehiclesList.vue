<script setup lang="ts">
import VehicleListItem from "./VehicleListItem.vue";
import { useVehicles } from "~/features/vehicles/useVehicles";

const { data: vehicles } = await useVehicles();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- <NewVehicleCard key="new-vehicle" /> -->

    <span v-if="!vehicles.length">No vehicles</span>
    <TransitionGroup name="fade">
      <VehicleListItem
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :vehicle="vehicle"
      />
    </TransitionGroup>
  </div>
</template>
