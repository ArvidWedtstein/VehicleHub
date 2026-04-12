<script setup lang="ts">
import type { Tables } from "~/types/supabase";
import ExpenseForm from "./components/ExpenseForm.vue";
import { useExpenseForm } from "./useExpenseForm";

const { vehicleId, expenseId } = defineProps<{
  vehicleId: Tables<"VehicleExpenses">["vehicle_id"];
  expenseId?: Tables<"VehicleExpenses">["id"];
}>();

const emit = defineEmits<{
  close: [boolean];
}>();

const { expenseSchema, expense, vehicle, isEdit, initialize, save } =
  useExpenseForm();

const toast = useToast();

const onOpen = () => {
  initialize(vehicleId, expenseId);
};

const onFormSubmit = async () => {
  try {
    // TODO: add form validation
    await save();

    toast.add({
      title: `Successfully ${expense.value?.id ? "updated" : "created"} expense`,
      color: "success",
    });

    emit("close", true);
  } catch (err: unknown) {
    const error = err as Error;
    const errorMessage = error?.message || "Unknown error";
    toast.add({
      title: `Something went wrong. ${errorMessage}`,
      color: "error",
    });
  }
};
</script>

<template>
  <UModal
    :title="isEdit ? 'Edit Expense' : 'Add Expense'"
    :close="{ onClick: () => emit('close', false) }"
    @after:enter="onOpen"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm :state="expense" :schema="expenseSchema" @submit="onFormSubmit">
        <ExpenseForm
          v-if="expense"
          v-model="expense"
          :key="expense?.id"
          :fuel_capacity="vehicle?.fuel_capacity"
          :mileage_unit="vehicle?.mileage_unit"
        />
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Cancel"
        variant="subtle"
        color="neutral"
        @click="emit('close', false)"
      />

      <UButton
        :label="isEdit ? 'Save' : 'Create'"
        color="primary"
        :icon="isEdit ? 'mdi:content-save' : 'mdi:plus'"
        @click="onFormSubmit"
      />
    </template>
  </UModal>
</template>
