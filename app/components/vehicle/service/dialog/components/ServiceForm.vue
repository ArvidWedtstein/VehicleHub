<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";
import ItemsTable from "./ItemsTable.vue";
import type { ServiceSchema } from "../useServiceForm";

type Props = {
  mileage_unit?: string;
};

withDefaults(defineProps<Props>(), {
  mileage_unit: "kilometer",
});

const service = defineModel<Partial<ServiceSchema>>({ required: true });

const serviceItems = defineModel<
  | TablesInsert<"VehicleServiceLogsItems">[]
  | TablesUpdate<"VehicleServiceLogsItems">[]
>("serviceItems", { required: true, default: [] });

const serviceTypeOptions = [
  "Oil Change",
  "Timing belt",
  "Timing Chain",
  "Brake Pads",
  "Tires",
  "Battery",
  "Spark Plugs",
  "Air Filter",
  "Fuel Filter",
  "Transmission Fluid",
  "Coolant",
];
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-6 gap-x-6 gap-y-4 flex-1">
    <UFormField class="sm:col-span-full" label="Date" name="date" required>
      <FormInputDateTime v-model="service.date" class="w-full hidden lg:flex" />
      <UInput
        type="datetime-local"
        v-model="service.date"
        class="w-full lg:hidden"
      />
      {{ service.date }}
    </UFormField>

    <UFormField class="sm:col-span-4" label="Type" name="type" required>
      <UInput
        type="text"
        v-model="service.type"
        class="w-full"
        list="service_types"
      />

      <datalist id="service_types">
        <option
          v-for="(option, optionIndex) in serviceTypeOptions"
          :key="optionIndex"
          :value="option"
        ></option>
      </datalist>
    </UFormField>

    <UFormField class="sm:col-span-2" label="Currency" name="currency">
      <USelect
        v-model="service.currency"
        :items="['NOK', 'EUR', 'GBP', 'USD', 'SEK', 'DDK']"
        :tabindex="-1"
        class="w-full"
      />
    </UFormField>

    <UFormField class="sm:col-span-3" label="Provider" name="provider">
      <UInput type="text" v-model.trim="service.provider" class="w-full" />
    </UFormField>

    <UFormField class="sm:col-span-3" label="Odometer Reading" name="mileage">
      <UInput
        type="number"
        icon="mdi:gauge-empty"
        v-model="service.mileage"
        :min="0"
        class="w-full"
      >
        <template #trailing>
          {{
            formatNumber(0, {
              style: "unit",
              unit: mileage_unit || "kilometer",
            }).replace("0", "")
          }}
        </template>
      </UInput>
    </UFormField>

    <UFormField class="col-span-full" label="Notes" name="notes">
      <UTextarea v-model="service.notes" :rows="3" class="w-full" />
    </UFormField>

    <div class="col-span-full">
      <ItemsTable v-model="service" v-model:serviceItems="serviceItems" />
    </div>
  </div>
</template>
