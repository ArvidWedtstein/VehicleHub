<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";
import ItemsTable from "./ItemsTable.vue";

type Props = {
  mileage_unit?: string;
};

withDefaults(defineProps<Props>(), {
  mileage_unit: "kilometer",
});

const service = defineModel<
  TablesInsert<"VehicleServiceLogs"> | TablesUpdate<"VehicleServiceLogs">
>({ required: true });

const serviceItems = defineModel<
  | TablesInsert<"VehicleServiceLogsItems">[]
  | TablesUpdate<"VehicleServiceLogsItems">[]
>("serviceItems", { required: true, default: [] });

const handleAddItem = () => {
  serviceItems.value.push({
    cost: 0,
    description: "",
    quantity: 1,
  } as TablesInsert<"VehicleServiceLogsItems">);
};
</script>

<template>
  <div class="my-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 flex-1">
    <FormInput
      wrapperClass="md:col-span-2"
      label="Date"
      type="datetime-local"
      v-model="service.date"
      required
    />

    <FormInput
      wrapperClass="md:col-span-2"
      label="Type"
      type="text"
      v-model="service.type"
      list="service_types"
    />

    <datalist id="service_types">
      <option
        v-for="(option, optionIndex) in [
          'Oil Change',
          'Timing belt',
          'Timing Chain',
          'Brake Pads',
        ]"
        :key="optionIndex"
        :value="option"
      ></option>
    </datalist>

    <FormInput
      wrapperClass="md:col-span-2"
      label="Provider"
      type="text"
      v-model.trim="service.provider"
    />

    <FormInput
      join
      label="Currency"
      type="select"
      wrapperClass="md:col-span-2"
      v-model="service.currency"
      :tabindex="-1"
      :options="[
        { value: 'NOK' },
        { value: 'EUR' },
        { value: 'GBP' },
        { value: 'USD' },
        { value: 'SEK' },
        { value: 'DDK' },
      ]"
    />

    <FormInput
      label="Odometer Reading"
      wrapperClass="md:col-span-2"
      type="text"
      inputmode="decimal"
      v-model="service.mileage"
      :min="0"
    >
      <template #icon>
        <Icon name="mdi:speedometer-slow" />
      </template>
      <template #addon>
        {{
          formatNumber(0, {
            style: "unit",
            unit: mileage_unit,
          }).replace("0", "")
        }}
      </template>
    </FormInput>

    <FormInput
      label="Notes"
      wrapperClass="md:col-span-2"
      type="textarea"
      rows="1"
      v-model="service.notes"
    />

    <div class="md:col-span-6">
      <ItemsTable v-model="service" v-model:serviceItems="serviceItems" />
    </div>
  </div>
</template>
