<script setup lang="ts">
import DrivetrainIcon from "~/components/icons/DrivetrainIcon.vue";
import type { VehicleSchema } from "../useVehicleForm";
import type { SelectMenuItem } from "@nuxt/ui";

const vehicle = defineModel<Partial<VehicleSchema>>({ required: true });

const transmissionTypeOptions: SelectMenuItem[] = [
  { label: "Manual" },
  { label: "Automatic" },
  { label: "CVT", description: "Continuously Variable Transmission" },
  { label: "DCT / DSG", description: "Dual Clutch Transmission" },
  { label: "Sequential Manual" },
];

const drivetrainOptions: ("FWD" | "RWD" | "AWD" | "4WD")[] = [
  "FWD",
  "RWD",
  "AWD",
  "4WD",
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
      <!-- <URadioGroup
      variant="table"
      v-model="vehicle.drivetrain"
      :items="driveTrainOptions"
      valueKey="label"
    /> -->

      <FormCheckboxTile
        v-model="vehicle.drivetrain"
        v-for="(drivetrain, idx) in drivetrainOptions"
        :key="idx"
        :value="drivetrain"
        type="radio"
        name="drivetrain"
      >
        <template #icon>
          <DrivetrainIcon class="w-6 fill-current" :drivetrain="drivetrain" />
        </template>
      </FormCheckboxTile>
    </UFormField>
  </div>
</template>
