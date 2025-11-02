<script setup lang="ts">
import type { Tables } from "~/types/supabase";
import type Modal from "~/components/Modal.vue";
import { useVehicleForm } from "./useVehicleForm";
import Stepper from "~/components/Stepper.vue";
import BasicInfoForm from "./components/BasicInfoForm.vue";
import EngineForm from "./components/EngineForm.vue";
import TransmissionForm from "./components/TransmissionForm.vue";

const modalRef = ref<InstanceType<typeof Modal>>();

const uploadedDocumentFiles = ref<File[]>([]);

const { vehicle, isEdit, initialize, save } = useVehicleForm();

const stepControl = reactive({
  step: 0,
  steps: ["General", "Engine", "Transmission"],
});

const changeStep = (stepIndex: number) => {
  stepControl.step = Math.max(
    0,
    Math.min(stepControl.steps.length - 1, stepIndex)
  );
};

const handleOpen = (vehicle_id?: Tables<"Vehicles">["id"]) => {
  stepControl.step = 0;

  initialize(vehicle_id);

  modalRef.value?.modalRef?.showModal();
};

const onFormSubmit = async () => {
  if (!modalRef.value) return;
  try {
    await save(uploadedDocumentFiles.value);

    toast.success(
      `Successfully ${vehicle.value.id ? "updated" : "created"} vehicle`
    );

    modalRef.value.modalRef?.close();
  } catch (err) {
    toast.error(`Something went wrong.${err}`);
  }
};

defineExpose({ modalRef: modalRef, open: handleOpen });
</script>

<template>
  <Modal ref="modalRef" :title="vehicle.id ? 'Edit Vehicle' : 'Add Vehicle'">
    <form @submit.prevent="onFormSubmit">
      <Stepper
        class="my-2"
        v-model="stepControl.step"
        :steps="stepControl.steps"
      >
        <template #step-general>
          <BasicInfoForm
            :key="vehicle.id"
            v-model="vehicle"
            v-model:files="uploadedDocumentFiles"
          />
        </template>
        <template #step-engine>
          <EngineForm v-model="vehicle" />
        </template>
        <template #step-transmission>
          <TransmissionForm v-model="vehicle" />
        </template>
      </Stepper>
    </form>

    <template #actions>
      <button type="button" class="btn me-3" @click="modalRef?.close">
        Cancel
      </button>

      <button
        type="button"
        class="btn btn-outline"
        @click="changeStep(stepControl.step - 1)"
        :disabled="stepControl.step === 0"
      >
        <Icon name="mdi:chevron-left" />
        Back
      </button>

      <button
        :disabled="stepControl.step === stepControl.steps.length - 1"
        type="button"
        class="btn btn-outline"
        @click="changeStep(stepControl.step + 1)"
      >
        Next
        <Icon name="mdi:chevron-right" />
      </button>

      <button
        type="button"
        @click="onFormSubmit"
        class="btn btn-primary ms-1"
        :disabled="!isEdit && stepControl.step !== stepControl.steps.length - 1"
      >
        <Icon :name="isEdit ? 'mdi:content-save' : 'mdi:plus'" />
        {{ isEdit ? "Save" : "Create" }}
      </button>
    </template>
  </Modal>
</template>
