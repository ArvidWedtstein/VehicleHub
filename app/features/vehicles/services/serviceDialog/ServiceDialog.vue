<script setup lang="ts">
import type { Tables, TablesUpdate } from "~/types/supabase";
import type Modal from "~/components/Modal.vue";
import { useServiceForm } from "./useServiceForm";
import FilesForm from "./components/FilesForm.vue";
import ServiceForm from "./components/ServiceForm.vue";
import type { StepperItem } from "@nuxt/ui";

const modalRef = ref<InstanceType<typeof Modal>>();

const stepControl = reactive({
  step: 0,
  steps: ["Service", "Files"],
});

const stepper = useTemplateRef("stepper");

const activeStep = ref("service");
const steps = ref<StepperItem[]>([
  {
    title: "Service",
    slot: "service",
    value: "service",
  },
  {
    title: "Files",
    slot: "files",
    value: "files",
  },
]);

const {
  service,
  serviceFiles,
  serviceItems,
  vehicle,
  isEdit,
  initialize,
  save,
} = useServiceForm();

const handleOpen = async (
  vehicle_id: Tables<"VehicleServiceLogs">["vehicle_id"],
  service_id?: TablesUpdate<"VehicleServiceLogs">["id"],
) => {
  stepControl.step = 0;

  await initialize(vehicle_id, service_id);

  if (!modalRef.value) return;

  modalRef.value?.open();
};

const onFormSubmit = async () => {
  try {
    await save();

    toast.success(
      `Successfully ${service.value.id ? "updated" : "created"} service`,
    );

    modalRef.value?.close();
  } catch (error) {
    toast.error(`Something went wrong. ${error}`);
  }
};

const changeStep = (stepIndex: number) => {
  stepControl.step = Math.max(
    0,
    Math.min(stepControl.steps.length - 1, stepIndex),
  );
};

defineExpose({
  open: handleOpen,
});
</script>

<template>
  <Modal
    id="serviceModal"
    ref="modalRef"
    :title="isEdit ? 'Edit Service' : 'Create Service'"
    @submit="onFormSubmit"
  >
    <form @submit.prevent="onFormSubmit">
      <UStepper
        ref="stepper"
        class="my-2 w-full"
        v-model="activeStep"
        :items="steps"
      >
        <template #service>
          <ServiceForm
            v-model="service"
            v-model:serviceItems="serviceItems"
            :mileage_unit="vehicle?.mileage_unit || 'kilometer'"
          />
        </template>
        <template #files>
          <FilesForm v-model="service" v-model:files="serviceFiles" />
        </template>
      </UStepper>
    </form>

    <template #actions>
      <UButton
        leadingIcon="mdi:arrow-left"
        label="Prev"
        color="neutral"
        variant="outline"
        :disabled="!stepper?.hasPrev"
        @click="stepper?.prev()"
      />

      <UButton
        trailingIcon="mdi:arrow-right"
        label="Next"
        color="neutral"
        variant="outline"
        :disabled="!stepper?.hasNext"
        @click="stepper?.next()"
      />

      <UButton
        :label="isEdit ? 'Save' : 'Create'"
        color="primary"
        :icon="isEdit ? 'mdi:content-save' : 'mdi:plus'"
        @click="onFormSubmit"
      />
    </template>
  </Modal>
</template>
