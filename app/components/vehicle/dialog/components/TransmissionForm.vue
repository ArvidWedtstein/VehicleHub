<script setup lang="ts">
import DrivetrainIcon from "~/components/icons/DrivetrainIcon.vue";
import type { SelectMenuItem } from "@nuxt/ui";
import { DRIVETRAIN_OPTIONS, type VehicleSchema } from "../useVehicleForm";

const vehicle = defineModel<Partial<VehicleSchema>>({ required: true });

const transmissionTypeOptions: SelectMenuItem[] = [
  { label: "Manual" },
  { label: "Automatic" },
  { label: "CVT", description: "Continuously Variable Transmission" },
  { label: "DCT / DSG", description: "Dual Clutch Transmission" },
  { label: "Sequential Manual" },
];
</script>

<template>
  <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-6 flex-1">
    <UFormField
      label="Transmission Type"
      name="transmission_type"
      class="md:col-span-2"
    >
      <USelectMenu
        class="w-full"
        v-model="vehicle.transmission_type"
        :items="transmissionTypeOptions"
        valueKey="label"
      />
    </UFormField>

    <UFormField label="Gears" name="transmission_gears" class="md:col-span-2">
      <UInput
        icon="mdi:gear"
        type="number"
        class="w-full"
        v-model="vehicle.transmission_gears"
        :min="0"
        :disabled="vehicle.transmission_type === 'CVT'"
      />
    </UFormField>
    <UFormField
      label="Drivetrain"
      name="drivetrain"
      class="md:col-span-2"
      :ui="{ container: 'flex gap-2' }"
    >
      <URadioGroup
        variant="table"
        v-model="vehicle.drivetrain"
        :items="DRIVETRAIN_OPTIONS.map((dt) => ({ label: dt, value: dt }))"
        indicator="hidden"
        orientation="horizontal"
        :ui="{
          wrapper: 'space-y-1',
          description: 'flex items-center justify-center',
        }"
      >
        <template #description="{ item }">
          <DrivetrainIcon class="w-6 fill-current" :drivetrain="item.value" />
        </template>
      </URadioGroup>
    </UFormField>
  </div>
</template>
