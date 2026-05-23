<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import type { VehicleSchema } from "../useVehicleForm";

const vehicle = defineModel<Partial<VehicleSchema>>({ required: true });

const { data: vehicleManufacturers } = useVehicleManufacturers();

const handleVIN = async () => {
  const vin = vehicle.value.vehicle_identification_number;

  if (!vin) {
    return;
  }

  const decodedVIN = await decodeVINAsync(vin);

  console.log("VIN Decoded", decodedVIN);
  if (!decodedVIN) {
    return;
  }

  vehicle.value.make ??= decodedVIN.manufacturer;
  vehicle.value.model ??= decodedVIN.model;
  vehicle.value.model_year ??= decodedVIN.modelYear;
  vehicle.value.fuel_type ??= decodedVIN.fuelType;
};

const { pending: modelsPending, data: models } = useVehicleManufacturerModels(
  vehicle.value.make,
);

const vehicleTypes: SelectMenuItem[] = [
  { value: "car", label: "Car", icon: "mdi:car" },
  { value: "boat", label: "Boat", icon: "mdi:boat" },
  { value: "tractor", label: "Tractor", icon: "mdi:tractor" },
  { value: "motorcycle", label: "Motorcycle", icon: "mdi:motorcycle" },
  { value: "truck", label: "Truck", icon: "mdi:truck" },
  { value: "bus", label: "Bus", icon: "mdi:bus" },
];

const vehicleColors: SelectMenuItem[] = [
  "Black",
  "Silver",
  "Grey",
  "Brown",
  "Red",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Blue",
  "Turquise",
  "Magenta",
  "White",
  "Beige",
  "Green",
  "Lime",
  "Aqua",
  "Olive",
];
</script>

<template>
  <div class="my-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
    <UFormField
      label="Vehicle Identification Number"
      name="vehicle_identification_number"
      help="We'll auto-fill make, model and year from this"
      class="sm:col-span-2"
    >
      <template #hint>
        <UTooltip
          text="Can usually be found on dashboard, driver's side door and registration certificate"
          :delayDuration="50"
        >
          <UIcon name="mdi:progress-question" />
        </UTooltip>
      </template>

      <UInput
        type="text"
        v-model.lazy="vehicle.vehicle_identification_number"
        class="w-full"
        @blur="handleVIN"
        autofocus
      />
    </UFormField>

    <UFormField
      label="License Plate Number"
      name="licenseplate_number"
      class="sm:col-span-2"
    >
      <UInput
        type="text"
        v-model="vehicle.licenseplate_number"
        pattern="^[a-zA-Z0-9]+$"
        class="w-full"
        placeholder="AB 123456"
      />
    </UFormField>

    <UFormField label="Type" name="type" class="sm:col-span-2" required>
      <USelectMenu
        v-model="vehicle.type"
        class="w-full"
        :items="vehicleTypes"
        labelKey="value"
        valueKey="value"
        :icon="
          vehicle.type !== 'other'
            ? `mdi:${vehicle.type?.toLowerCase()}`
            : undefined
        "
      />
    </UFormField>

    <UFormField label="Make" name="make" class="sm:col-span-2" required>
      <USelectMenu
        v-model="vehicle.make"
        class="w-full"
        autocapitalize="words"
        :items="vehicleManufacturers"
        labelKey="name"
        valueKey="name"
        :content="{ hideWhenEmpty: true }"
        :loading="modelsPending"
      />
    </UFormField>

    <UFormField label="Model" name="model" class="sm:col-span-2">
      <UInputMenu
        v-model="vehicle.model"
        class="w-full"
        mode="autocomplete"
        autocapitalize="words"
        :items="models"
      />
    </UFormField>

    <UFormField label="Model Year" name="model_year" class="sm:col-span-2">
      <UInput
        v-model="vehicle.model_year"
        type="number"
        class="w-full"
        :min="1885"
        :max="new Date().getFullYear() + 10"
        :step="1"
      />
    </UFormField>

    <UFormField label="Color" name="color" class="sm:col-span-2">
      <UInputMenu
        v-model="vehicle.color"
        type="text"
        mode="autocomplete"
        :items="vehicleColors"
        class="w-full"
        labelKey="value"
        valueKey="value"
      >
        <template #item-leading="{ item }">
          <span
            :style="{
              backgroundColor: (item || '').toString().toLowerCase(),
            }"
            class="size-3 shrink-0 rounded-full self-center"
          ></span>
        </template>
      </UInputMenu>
    </UFormField>

    <UFormField
      label="Thumbnail"
      name="thumbnail"
      class="sm:col-span-2"
      description="JPG, GIF or PNG. 2MB Max."
    >
      <UFileUpload
        v-model="vehicle.thumbnail"
        accept="image/*"
        class="min-h-48"
      />
    </UFormField>
  </div>
</template>
