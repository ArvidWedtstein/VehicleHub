<script setup lang="ts">
import type Modal from "~/components/Modal.vue";
import type { Tables } from "~/types/supabase";
import ExpenseForm from "./components/ExpenseForm.vue";
import { useExpenseForm } from "./useExpenseForm";

const modalRef = ref<InstanceType<typeof Modal>>();

const { expense, vehicle, isEdit, initialize, save } = useExpenseForm();

const handleOpen = async (
  vehicle_id: Tables<"VehicleExpenses">["vehicle_id"],
  expense_id?: Tables<"VehicleExpenses">["id"]
) => {
  await initialize(vehicle_id, expense_id);

  modalRef.value?.modalRef?.showModal();
};

const onFormSubmit = async () => {
  if (!modalRef.value) return;
  try {
    await save();

    toast.success(
      `Successfully ${expense.value.id ? "updated" : "created"} expense`
    );

    modalRef.value.modalRef?.close();
  } catch (err: unknown) {
    const error = err as Error;
    const errorMessage = error?.message || "Unknown error";
    toast.error(`Something went wrong. ${errorMessage}`);
  }
};

defineExpose({ modalRef: modalRef, open: handleOpen });
</script>

<template>
  <Modal ref="modalRef" :title="isEdit ? 'Edit Expense' : 'Add Expense'">
    <form @submit.prevent="onFormSubmit">
      <ExpenseForm
        v-model="expense"
        :key="expense.id"
        :fuel_capacity="vehicle?.fuel_capacity"
        :mileage_unit="vehicle?.mileage_unit"
      />
    </form>

    <template #actions>
      <button type="button" class="btn" @click="modalRef?.close">Cancel</button>

      <button type="button" @click="onFormSubmit" class="btn btn-primary">
        <Icon :name="isEdit ? 'mdi:content-save' : 'mdi:plus'" />
        {{ isEdit ? "Save" : "Create" }}
      </button>
    </template>
  </Modal>
</template>
