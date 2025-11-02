<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";

const vehicle = defineModel<
  TablesInsert<"Vehicles"> | TablesUpdate<"Vehicles">
>({ required: true });

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
    <FormInput
      wrapperClass="sm:col-span-2"
      label="Fuel Type"
      type="select"
      v-model="vehicle.fuel_type"
      :options="fuelTypeOptions.map((p) => ({ value: p }))"
    />

    <FormInputGroup class="sm:col-span-3">
      <FormInput
        label="Fuel Capacity"
        type="number"
        inputmode="decimal"
        v-model="vehicle.fuel_capacity"
        join
      />

      <FormInput
        wrapperClass="max-w-28"
        join
        type="select"
        v-model="vehicle.fuel_capacity_unit"
        :options="fuelCapacityUnitOptions"
      />
    </FormInputGroup>

    <FormInputGroup class="sm:col-span-2">
      <FormInput
        label="Engine Displacement"
        type="text"
        inputmode="decimal"
        v-model="vehicle.engine_displacement"
        join
      />

      <FormInput
        wrapperClass="max-w-fit"
        type="select"
        join
        v-model="vehicle.engine_displacement_unit"
        :options="engineDisplacementUnitOptions"
      />
    </FormInputGroup>

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Cylinders"
      type="number"
      :min="0"
      :max="64"
      v-model="vehicle.engine_cylinders"
    />

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Mileage Unit"
      type="select"
      v-model="vehicle.mileage_unit"
      :options="milageUnitOptions"
      helpText="The unit in which the mileage is measured"
    />
  </div>
</template>
