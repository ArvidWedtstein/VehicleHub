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
    <NuxtLink
      :to="{ name: 'vehicles-id-expenses', params: { id: vehicle.id } }"
      class="card-body gap-2"
    >
      <div class="flex justify-between grow items-start">
        <div class="flex flex-col items-start justify-start gap-2">
          <h2
            class="card-title text-primary uppercase"
            v-show="vehicle.licenseplate_number"
          >
            {{ vehicle.licenseplate_number }}
          </h2>
          <p class="uppercase">{{ vehicleMakeModel }}</p>
          <p class="uppercase" v-show="vehicle.model_year">
            ({{ vehicle.model_year }})
          </p>
        </div>

        <AvatarImage
          v-show="vehicle?.thumbnail"
          :src="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}`"
        />
      </div>

      <div class="card-actions justify-end">
        <NuxtLink
          :to="{ name: 'vehicles-id-expenses', params: { id: vehicle.id } }"
          class="md:inline-flex btn btn-primary hidden"
        >
          View
        </NuxtLink>
      </div>
    </NuxtLink>
  </div>
</template>
