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
        <UInput
          type="number"
          v-model="expense.amount"
          :min="0"
          :max="fuel_capacity || 10000"
          class="grow"
        />

        <USelectMenu
          v-model="expense.unit"
          :items="[
            { value: 'liter', label: 'Liter' },
            { value: 'us_gallon', label: 'US Gallon' },
            { value: 'imp_gallon', label: 'Imperial Gallon' },
          ]"
          valueKey="value"
          labelKey="label"
        />
      </UFieldGroup>
    </UFormField>

    <UFormField label="Cost" name="cost" required class="sm:col-span-2">
      <UFieldGroup class="w-full">
        <UInput
          type="number"
          v-model="expense.cost"
          :min="0"
          :disabled="expense.type === 'Electric'"
          class="w-full"
        />

        <USelect
          v-model="expense.currency"
          :disabled="expense.type === 'Electric'"
          :items="['NOK', 'EUR', 'GBP', 'USD', 'SEK', 'DDK']"
          :tabindex="-1"
        />
      </UFieldGroup>
    </UFormField>

    <UFormField class="sm:col-span-2" label="Odometer Reading" name="mileage">
      <UInput
        type="number"
        icon="mdi:gauge-empty"
        v-model="expense.mileage"
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

    <UFormField class="sm:col-span-2" label="Notes" name="notes">
      <UTextarea v-model="expense.notes" :rows="3" class="w-full" />
    </UFormField>
  </div>
</template>
