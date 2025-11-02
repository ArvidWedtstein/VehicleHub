<script setup lang="ts">
import CheckboxTile from "~/components/form/CheckboxTile.vue";
import DrivetrainIcon from "~/components/icons/DrivetrainIcon.vue";
import type { TablesInsert, TablesUpdate } from "~/types/supabase";

const vehicle = defineModel<
  TablesInsert<"Vehicles"> | TablesUpdate<"Vehicles">
>({ required: true });

const transmissionTypeOptions = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
];
</script>

<template>
  <div class="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
    <FormInput
      wrapperClass="sm:col-span-2"
      label="Type"
      type="select"
      v-model="vehicle.transmission_type"
      :options="transmissionTypeOptions"
    />

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Gears"
      type="number"
      inputmode="decimal"
      v-model="vehicle.transmission_gears"
    />

    <div class="fieldset">
      <label class="fieldset-legend">Drivetrain</label>

      <div class="flex gap-2">
        <CheckboxTile
          v-model="vehicle.drivetrain"
          value="FWD"
          type="radio"
          name="drivetrain"
        >
          <template #icon>
            <DrivetrainIcon class="w-6 fill-current" drivetrain="FWD" />
          </template>
        </CheckboxTile>

        <CheckboxTile
          v-model="vehicle.drivetrain"
          value="RWD"
          type="radio"
          name="drivetrain"
        >
          <template #icon>
            <DrivetrainIcon class="w-6 fill-current" drivetrain="RWD" />
          </template>
        </CheckboxTile>

        <CheckboxTile
          v-model="vehicle.drivetrain"
          value="AWD"
          type="radio"
          name="drivetrain"
        >
          <template #icon>
            <DrivetrainIcon class="w-6 fill-current" drivetrain="AWD" />
          </template>
        </CheckboxTile>
      </div>
    </div>
  </div>
</template>
