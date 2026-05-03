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
  { value: "fluid-ounce", label: "Ounce" },
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
  { value: "acre", label: "Acre" },
];
</script>

<template>
  <div class="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
    <UFormField label="Fuel Type" name="fuel_type" class="sm:col-span-2">
      <UInputMenu
        v-model="vehicle.fuel_type"
        class="w-full"
        :items="fuelTypeOptions"
      />
    </UFormField>

    <UFormField
      label="Fuel Capacity"
      name="fuel_capacity"
      class="sm:col-span-3"
    >
      <UInput v-model.number="vehicle.fuel_capacity" class="w-full" />
    </UFormField>

    <UFormField
      label="Fuel Unit"
      name="fuel_capacity_unit"
      class="sm:col-span-1"
    >
      <USelect
        v-model="vehicle.fuel_capacity_unit"
        :items="fuelCapacityUnitOptions"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="Displacement"
      name="engine_displacement"
      class="sm:col-span-1"
    >
      <UInput class="w-full" v-model="vehicle.engine_displacement" />
    </UFormField>

    <UFormField
      label="Displacement Unit"
      name="engine_displacement_unit"
      class="sm:col-span-1"
    >
      <USelect
        class="w-full"
        v-model="vehicle.engine_displacement_unit"
        :items="engineDisplacementUnitOptions"
      />
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
