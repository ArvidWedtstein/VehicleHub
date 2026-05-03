<script setup lang="ts">
import VehicleDialog from "./dialog/VehicleDialog.vue";

const { data: vehicles, pending, status, refresh } = useVehicles();

const overlay = useOverlay();

const vehicleModal = overlay.create(VehicleDialog);

const createVehicle = () => {
  vehicleModal.open();
};
</script>

<template>
  <UPageGrid>
    <VehicleSkeleton
      v-if="pending || status === 'idle' || status === 'pending'"
      v-for="i in 3"
      :key="i"
    />

    <UEmpty
      v-else-if="vehicles && vehicles.length === 0"
      title="No Vehicles found"
      description="It looks like you haven't added any vehicles. Create one to get started."
      class="col-span-full"
      :actions="[
        {
          label: 'Create New',
          icon: 'mdi:plus',
          onClick: createVehicle,
        },
        {
          label: 'Refresh',
          icon: 'mdi:refresh',
          onClick: () => refresh(),
        },
      ]"
    />

    <UPageCard
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      variant="soft"
      :title="vehicle.licenseplate_number || vehicle.make || 'Unknown Vehicle'"
      :description="`${vehicle.model_year || ''} ${vehicle.make} ${vehicle.model}`"
      :to="{
        name: 'vehicles-id-expenses',
        params: { id: vehicle.id },
      }"
    >
      <template #header>
        <UAvatar
          v-if="vehicle?.thumbnail"
          :src="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}?Quality=20`"
          size="md"
        />
      </template>
    </UPageCard>

    <UPageCard
      variant="subtle"
      title="Add new Vehicle"
      icon="mdi:plus"
      @click="createVehicle"
    />
  </UPageGrid>
</template>
