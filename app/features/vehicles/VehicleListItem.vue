<script setup lang="ts">
import type { Tables } from "~/types/supabase";

type Props = {
  vehicle: Partial<Tables<"Vehicles">>;
};

const props = defineProps<Props>();

const vehicleMakeModel = computed(() => {
  const make = props.vehicle.make || "Unknown";
  const model = props.vehicle.model || "Unknown";

  return `${make} ${model}`;
});
</script>

<template>
  <div class="card card-sm bg-base-200 shadow">
    <div class="card-body gap-2">
      <div class="flex justify-between grow items-start">
        <div class="flex flex-col items-start justify-start gap-2">
          <h2 class="card-title uppercase" v-if="vehicle.licenseplate_number">
            {{ vehicle.licenseplate_number }}
          </h2>
          <p class="uppercase">{{ vehicleMakeModel }}</p>
          <p class="uppercase" v-show="vehicle.model_year">
            ({{ vehicle.model_year }})
          </p>
        </div>

        <AvatarImage
          v-if="vehicle?.thumbnail"
          :src="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}`"
        />

        <!-- <MotorcycleIcon
          v-else-if="vehicle.type === 'Motorcycle'"
          class="size-10"
        />
        <CarIcon v-else-if="vehicle.type === 'Car'" class="size-10" /> -->
      </div>

      <div class="card-actions justify-end">
        <NuxtLink
          :to="{ name: 'vehicles-id-expenses', params: { id: vehicle.id } }"
          class="btn btn-primary"
        >
          View
          <!-- <ChevronRightIcon /> -->
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
