<script setup lang="ts">
const { data: vehicles, pending } = useVehicles();
</script>

<template>
  <UPageGrid>
    <span v-if="pending">Loading...</span>

    <UEmpty
      v-else-if="vehicles && vehicles.length === 0"
      title="No Vehicles found"
      description="It looks like you haven't added any vehicles. Create one to get started."
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
  </UPageGrid>
</template>
