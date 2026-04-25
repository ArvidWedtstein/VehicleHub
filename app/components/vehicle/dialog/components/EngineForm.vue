<script setup lang="ts">
import type { VehicleSchema } from "../useVehicleForm";

const vehicle = defineModel<Partial<VehicleSchema>>({ required: true });

const fuelTypeOptions = [
  "Gasoline",
  "Diesel",
  "Kerosene",
  "Gas",
  "Electric",
  "Hydrogen",
  "Other",
  "Biodiesel",
  "Biogasoline",
  "LPG-gas",
  "CNG-gas",
  "Metanol",
  "Etanol",
  "LPG-A",
  "LPG-B",
  "CNG 20",
  "CNG 25",
];

const fuelCapacityUnitOptions = [
  { value: "liter", label: "Liter" },
  { value: "gallon", label: "US Gallon" },
  { value: "imp_gallon", label: "Imperial Gallon" },
];

const engineDisplacementUnitOptions = [
  { value: "liter", label: "Liter" },
  { value: "cubic-centimeter", label: "Cubic Centimeter (CC)" },
  { value: "cubic-inch", label: "Cubic Inch" },
];

const milageUnitOptions = [
  { value: "kilometer", label: "Kilometer" },
  { value: "mile", label: "Mile" },
  { value: "yards", label: "Yards" },
  { value: "feet", label: "Feet" },
];
</script>

<template>
  <div class="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
    <UFormField label="Fuel Type" name="fuel_type" class="sm:col-span-2">
      <UInputMenu
        v-model="vehicle.fuel_type"
        class="w-full"
        autocomplete
        :items="fuelTypeOptions"
      />
    </UFormField>

    <UFormField
      label="Fuel Capacity"
      name="fuel_capacity"
      class="sm:col-span-4"
    >
      <UFieldGroup class="w-full">
        <UInputMenu v-model="vehicle.fuel_capacity" class="grow" autocomplete />
        <USelect
          class="shrink-0"
          v-model="vehicle.fuel_capacity_unit"
          :items="fuelCapacityUnitOptions"
        />
      </UFieldGroup>
    </UFormField>

    <UFormField
      label="Engine Displacement"
      name="engine_displacement"
      class="sm:col-span-2"
    >
      <UFieldGroup class="w-full">
        <UInput class="grow" v-model="vehicle.engine_displacement" />
        <USelect
          class="shrink-0"
          v-model="vehicle.engine_displacement_unit"
          :items="engineDisplacementUnitOptions"
        />
      </UFieldGroup>
    </UFormField>

    <UFormField label="Cylinders" name="engine_cylinders" class="sm:col-span-2">
      <UInputNumber
        class="w-full"
        :min="1"
        :max="100"
        v-model="vehicle.engine_cylinders"
        :disabled="vehicle.fuel_type === 'Electric'"
      />
    </UFormField>

    <UFormField
      label="Mileage Unit"
      name="mileage_unit"
      help="The unit in which the mileage is measured"
      class="sm:col-span-2"
    >
      <USelect
        class="w-full"
        v-model="vehicle.mileage_unit"
        :items="milageUnitOptions"
      />
    </UFormField>
  </div>
</template>
