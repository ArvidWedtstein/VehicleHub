<script setup lang="ts">
import type { ExpenseSchema } from "../useExpenseForm";

type Props = {
  mileage_unit?: string | null;
  fuel_capacity?: number | null;
};
withDefaults(defineProps<Props>(), {
  mileage_unit: "kilometer",
  fuel_capacity: 10000,
});

const expense = defineModel<Partial<ExpenseSchema>>({ required: true });
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-x-6 gap-y-4 flex-1">
    <UFormField class="sm:col-span-4" label="Date" name="date" required>
      <FormInputDateTime v-model="expense.date" class="w-full hidden lg:flex" />
      <UInput
        type="datetime-local"
        v-model="expense.date"
        class="w-full lg:hidden"
      />
    </UFormField>

    <UFormField label="Amount" name="amount" required class="sm:col-span-2">
      <UFieldGroup class="w-full">
        <USelectMenu
          v-model="expense.unit"
          :items="[
            { value: 'liter', label: 'Liter' },
            { value: 'gallon', label: 'Gallon' },
          ]"
          valueKey="value"
          labelKey="label"
          :tabIndex="-1"
        />

        <UInputNumber
          v-model="expense.amount"
          :min="0"
          :max="fuel_capacity || 10000"
          class="flex-1"
          :step="0.01"
          :formatOptions="{
            style: 'unit',
            unit: expense.unit || 'liter',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }"
        />
      </UFieldGroup>
    </UFormField>

    <UFormField label="Cost" name="cost" required class="sm:col-span-2">
      <UFieldGroup class="w-full">
        <USelectMenu
          v-model="expense.currency"
          :disabled="expense.type === 'Electric'"
          :items="['NOK', 'EUR', 'GBP', 'USD', 'SEK', 'DDK']"
          :tabIndex="-1"
          class="w-20"
        />

        <UInputNumber
          v-model="expense.cost"
          placeholder="0.00"
          :step="0.01"
          :formatOptions="{
            style: 'currency',
            currency: expense.currency || 'NOK',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }"
          :min="0"
          :disabled="expense.type === 'Electric'"
          class="flex-1"
        />
      </UFieldGroup>
    </UFormField>

    <UFormField class="sm:col-span-2" label="Odometer Reading" name="mileage">
      <UInputNumber
        icon="mdi:gauge-empty"
        v-model="expense.mileage"
        class="w-full"
        :formatOptions="{
          style: 'unit',
          unit: mileage_unit || 'kilometer',
          unitDisplay: 'short',
          useGrouping: false,
          maximumFractionDigits: 1,
        }"
      />
    </UFormField>

    <UFormField class="sm:col-span-2" label="Notes" name="notes">
      <UTextarea v-model="expense.notes" :rows="3" class="w-full" />
    </UFormField>
  </div>
</template>
