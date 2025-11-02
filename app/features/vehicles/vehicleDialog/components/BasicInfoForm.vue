<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";
import { useVehicleManufacturers } from "../../useVehicleManufacturers";
import InputHelperTip from "~/components/form/InputHelperTip.vue";

const vehicle = defineModel<
  TablesInsert<"Vehicles"> | TablesUpdate<"Vehicles">
>({ required: true });

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
        "S"
      )}?format=json`
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
</script>

<template>
  <div class="my-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
    <FormInput
      wrapperClass="sm:col-span-2"
      label="Liscense Plate Number"
      type="text"
      v-model="vehicle.licenseplate_number"
      pattern="^[a-zA-Z0-9]+$"
      validate
      placeholder="AB 123456"
      autofocus
    />

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Vehicle Identification Number"
      type="text"
      v-model.trim="vehicle.vehicle_identification_number"
      pattern="^[a-zA-Z0-9]+$"
      validate
      :maxlength="17"
      @blur="handleVIN"
    >
      <template #label="{ label }">
        <div class="fieldset-legend">
          <abbr :title="label">VIN</abbr>
          <InputHelperTip
            position="left"
            tip="Can usually be found on dashboard, driver's side door and registration certificate"
          />
        </div>
      </template>
    </FormInput>

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Type"
      type="select"
      v-model="vehicle.type"
      :options="[
        { value: 'Car' },
        { value: 'Tractor' },
        { value: 'Motorcycle' },
        { value: 'Trailer' },
        { value: 'Truck' },
        { value: 'Bus' },
        { value: 'Other' },
      ]"
    />

    <FormInput
      label="Make"
      type="text"
      wrapperClass="sm:col-span-2"
      v-model="vehicle.make"
      list="vehicle_makes"
      autocapitalize="words"
      @blur="getModels"
    />

    <datalist id="vehicle_makes">
      <option
        v-for="(option, optionIndex) in vehicleManufacturers"
        :key="optionIndex"
        :value="option.name"
      ></option>
    </datalist>

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Model"
      type="text"
      list="vehicle_models"
      v-model="vehicle.model"
    />
    <datalist id="vehicle_models">
      <option
        v-for="(option, optionIndex) in availableModels"
        :key="optionIndex"
        :value="option"
      ></option>
    </datalist>

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Model Year"
      type="number"
      inputmode="decimal"
      step="1"
      :min="1885"
      v-model="vehicle.model_year"
    />

    <FormInput
      wrapperClass="sm:col-span-2"
      label="Color"
      type="select"
      v-model="vehicle.color"
      :options="[
        { value: 'Black' },
        { value: 'Silver' },
        { value: 'Grey' },
        { value: 'Brown' },
        { value: 'Red' },
        { value: 'Yellow' },
        { value: 'Orange' },
        { value: 'Purple' },
        { value: 'Pink' },
        { value: 'Blue' },
        { value: 'Turquise' },
        { value: 'Magenta' },
        { value: 'White' },
        { value: 'Beige' },
        { value: 'Green' },
        { value: 'Lime' },
        { value: 'Aqua' },
        { value: 'Olive' },
      ]"
    />

    <!-- TODO: fix -->
    <label class="fieldset w-full sm:col-span-2">
      <div class="fieldset-legend">Thumbnail</div>
      <input
        type="file"
        class="file-input w-full max-w-xs"
        accept="image/png, image/jpeg, image/webp"
        @change="uploadThumbnail"
        max="5000000"
      />
      <span class="fieldset-label">Vehicle Image</span>
    </label>
  </div>
</template>
