<script setup lang="ts">
import { useVehicleManufacturers } from "../../useVehicleManufacturers";
import InputHelperTip from "~/components/form/InputHelperTip.vue";
import type { VehicleSchema } from "../useVehicleForm";

const vehicle = defineModel<Partial<VehicleSchema>>({ required: true });

const files = defineModel<Array<File>>("files", {
  required: false,
  default: () => [],
});

const { data: vehicleManufacturers } = await useVehicleManufacturers();

const handleVIN = () => {
  const vin = vehicle.value.vehicle_identification_number;

  if (!vin) {
    return;
  }

  const decodedVIN = decodeVIN(vin);

  if (!decodedVIN) {
    return;
  }

  vehicle.value.make = decodedVIN.manufacturer;
  vehicle.value.model_year = decodedVIN.modelYear;

  getModels();
};

const availableModels = ref<Array<string>>([]);

const getModels = async () => {
  try {
    if (!vehicle.value.make) return;

    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${vehicle.value.make.replace(
        "Š",
        "S",
      )}?format=json`,
    );

    if (!res.ok || res.status !== 200) return;

    const json = await res.json();

    const { Results } = json as {
      Results: { Model_Name: string }[];
    };

    availableModels.value = Results.map((p) => p.Model_Name);
  } catch (error) {
    console.error(error);
  }
};

const uploadThumbnail = async (event: Event) => {
  const target = event.target as HTMLInputElement;

  files.value = Array.from(target.files || []);
};

const vehicleTypes = [
  { value: "Car", icon: "mdi:car" },
  { value: "Boat", icon: "mdi:boat" },
  { value: "Tractor", icon: "mdi:tractor" },
  { value: "Motorcycle", icon: "mdi:motorcycle" },
  { value: "Truck", icon: "mdi:truck" },
  { value: "Bus", icon: "mdi:bus" },
  { value: "Other" },
];

const vehicleColors = [
  { value: "Black" },
  { value: "Silver" },
  { value: "Grey" },
  { value: "Brown" },
  { value: "Red" },
  { value: "Yellow" },
  { value: "Orange" },
  { value: "Purple" },
  { value: "Pink" },
  { value: "Blue" },
  { value: "Turquise" },
  { value: "Magenta" },
  { value: "White" },
  { value: "Beige" },
  { value: "Green" },
  { value: "Lime" },
  { value: "Aqua" },
  { value: "Olive" },
];
</script>

<template>
  <div class="my-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
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
        autofocus
      />
    </UFormField>

    <UFormField
      label="Vehicle Identification Number"
      name="vehicle_identification_number"
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
        v-model="vehicle.vehicle_identification_number"
        class="w-full"
        @blur="handleVIN"
        :maxlength="17"
      />
    </UFormField>

    <UFormField label="Type" name="type" class="sm:col-span-2">
      <USelectMenu
        v-model="vehicle.type"
        class="w-full"
        :items="vehicleTypes"
        labelKey="value"
        valueKey="value"
      />
    </UFormField>

    <UFormField label="Make" name="make" class="sm:col-span-2">
      <UInputMenu
        v-model="vehicle.make"
        class="w-full"
        autocomplete
        autocapitalize="words"
        :items="vehicleManufacturers"
        labelKey="name"
        valueKey="name"
        :trailingIcon="false"
        :content="{ hideWhenEmpty: true }"
        @blur="getModels"
      />
    </UFormField>

    <UFormField label="Model" name="model" class="sm:col-span-2">
      <UInputMenu
        v-model="vehicle.model"
        class="w-full"
        autocomplete
        autocapitalize="words"
        :items="availableModels"
        :trailingIcon="false"
        :content="{ hideWhenEmpty: true }"
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
        autocomplete
        :items="vehicleColors"
        class="w-full"
        labelKey="value"
        valueKey="value"
      >
        <template #item-leading="{ item }">
          <span
            :style="{
              backgroundColor: item.value.toLowerCase(),
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
