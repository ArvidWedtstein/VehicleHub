<script setup lang="ts">
import type { Tables } from "~/types/supabase";
import VehicleListItem from "./VehicleListItem.vue";

const { vehicles } = defineProps<{
  vehicles: Tables<"Vehicles">[];
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
    <!-- <NewVehicleCard key="new-vehicle" /> -->

    <span v-if="!vehicles.length">No vehicles</span>
    <TransitionGroup name="fade">
      <!-- <template v-if="loading">
        <VehicleCardSkeletonLoader v-for="i in 6" :key="i" />
      </template> -->

      <VehicleListItem
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :vehicle="vehicle"
      />
    </TransitionGroup>
  </div>
</template>
