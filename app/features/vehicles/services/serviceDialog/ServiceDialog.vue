<script setup lang="ts">
import type { Tables, TablesUpdate } from "~/types/supabase";
import type Modal from "~/components/Modal.vue";
import { useServiceForm } from "./useServiceForm";
import FilesForm from "./components/FilesForm.vue";
import ServiceForm from "./components/ServiceForm.vue";

const modalRef = ref<InstanceType<typeof Modal>>();

const stepControl = reactive({
  step: 0,
  steps: ["Service", "Files"],
});

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

onMounted(() => {
  console.log("mounted");
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
      <Stepper
        class="my-2"
        v-model="stepControl.step"
        :steps="stepControl.steps"
      >
        <template #step-service>
          <ServiceForm
            v-model="service"
            v-model:serviceItems="serviceItems"
            :mileage_unit="vehicle?.mileage_unit || 'kilometer'"
          />
        </template>
        <template #step-files>
          <FilesForm v-model="service" v-model:files="serviceFiles" />
        </template>
      </Stepper>
    </form>

    <template #actions>
      <button
        type="button"
        class="btn btn-outline"
        @click="changeStep(stepControl.step - 1)"
        :disabled="stepControl.step === 0"
      >
        <Icon name="mdi:chevron-left" size="1.2em" />
        Back
      </button>
      <button
        type="button"
        class="btn btn-outline"
        @click="changeStep(stepControl.step + 1)"
        :disabled="stepControl.step === stepControl.steps.length - 1"
      >
        Next
        <Icon name="mdi:chevron-right" size="1.2em" />
      </button>

      <button type="button" @click="onFormSubmit" class="btn btn-primary ms-1">
        <Icon :name="isEdit ? 'mdi:content-save' : 'mdi:plus'" size="1.2em" />

        {{ isEdit ? "Save" : "Create" }}
      </button>
    </template>
  </Modal>
</template>
