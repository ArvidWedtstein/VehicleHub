<script setup lang="ts">
import type { Tables } from "~/types/supabase";

type Props = {
  vehicle: Partial<Tables<"Vehicles">>;
};

const { vehicle } = defineProps<Props>();

const vehicleMakeModel = computed(() => {
  const make = vehicle.make || "Unknown";
  const model = vehicle.model || "Unknown";

  return `${make} ${model}`;
});
</script>

<template>
  <div
    class="card card-sm bg-base-200 shadow-md focus:border-primary hover:border-primary border border-transparent transition"
  >
    <NuxtLink :to="`/vehicles/${vehicle.id}/expenses`" class="card-body gap-2">
      <div class="flex justify-between grow items-start">
        <div class="flex flex-col items-start justify-start gap-2">
          <h2
            class="card-title text-primary uppercase"
            v-if="vehicle.licenseplate_number"
          >
            {{ vehicle.licenseplate_number }}
          </h2>
          <p class="uppercase">{{ vehicleMakeModel }}</p>
          <p class="uppercase" v-if="vehicle.model_year">
            ({{ vehicle.model_year }})
          </p>
        </div>

        <AvatarImage
          v-if="vehicle?.thumbnail"
          :src="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}?Quality=20`"
        />
      </div>
    </NuxtLink>
  </div>
</template>
