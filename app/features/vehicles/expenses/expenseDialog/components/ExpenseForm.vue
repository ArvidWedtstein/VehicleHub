<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";

type Props = {
  mileage_unit?: string | null;
  fuel_capacity?: number | null;
};
withDefaults(defineProps<Props>(), {
  mileage_unit: "kilometer",
  fuel_capacity: 10000,
});

const expense = defineModel<
  TablesInsert<"VehicleExpenses"> | TablesUpdate<"VehicleExpenses">
>({ required: true });
</script>

<template>
  <div class="my-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-4 flex-1">
    <FormInput
      wrapperClass="sm:col-span-4"
      label="Date"
      type="datetime-local"
      v-model="expense.date"
      required
    />

    <FormInputGroup class="sm:col-span-2">
      <FormInput
        required
        label="Amount"
        type="text"
        inputmode="decimal"
        join
        v-model.number="expense.amount"
        :min="0"
        :max="fuel_capacity || 10000"
      />

      <FormInput
        wrapperClass="max-w-fit"
        join
        type="select"
        v-model="expense.unit"
        placeholder="Select a unit"
        :tabindex="-1"
        :options="[
          { value: 'liter', label: 'Liter' },
          { value: 'us_gallon', label: 'US Gallon' },
          { value: 'imp_gallon', label: 'Imperial Gallon' },
        ]"
      />
    </FormInputGroup>

    <FormInputGroup class="sm:col-span-2">
      <FormInput
        label="Cost"
        type="text"
        inputmode="decimal"
        :disabled="expense.type === 'Electric'"
        join
        v-model.number="expense.cost"
        :min="0"
      />

      <FormInput
        wrapperClass="max-w-fit"
        type="select"
        join
        v-model="expense.currency"
        :disabled="expense.type === 'Electric'"
        placeholder="Select a currency"
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
    </FormInputGroup>

    <FormInput
      label="Odometer Reading"
      wrapperClass="sm:col-span-2"
      type="text"
      inputmode="numeric"
      v-model="expense.mileage"
      icon="mdi:gauge-empty"
    >
      <template #trailing>
        {{
          formatNumber(0, {
            style: "unit",
            unit: mileage_unit || "kilometer",
          }).replace("0", "")
        }}
      </template>
    </FormInput>

    <FormInput
      label="Notes"
      wrapperClass="sm:col-span-2"
      type="textarea"
      class="w-full"
      v-model="expense.notes"
    />
  </div>
</template>
