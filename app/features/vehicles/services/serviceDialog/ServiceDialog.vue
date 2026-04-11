<script setup lang="ts">
import type { Tables, TablesUpdate } from "~/types/supabase";
import type Modal from "~/components/Modal.vue";
import { useServiceForm } from "./useServiceForm";
import FilesForm from "./components/FilesForm.vue";
import ServiceForm from "./components/ServiceForm.vue";
import type { StepperItem } from "@nuxt/ui";

const modalRef = ref<InstanceType<typeof Modal>>();

const { vehicleId, serviceId } = defineProps<{
  vehicleId: Tables<"VehicleServiceLogs">["vehicle_id"];
  serviceId?: Tables<"VehicleServiceLogs">["id"];
}>();

const emit = defineEmits<{
  close: [boolean];
}>();

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
    icon: "mdi:files",
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
  await initialize(vehicle_id, service_id);

  if (!modalRef.value) return;

  modalRef.value?.open();
};

const toast = useToast();

const onOpen = () => {
  initialize(vehicleId, serviceId);
};

const onFormSubmit = async () => {
  try {
    await save();

    toast.add({
      title: `Successfully ${service.value.id ? "updated" : "created"} service`,
      color: "success",
    });

    modalRef.value?.close();
  } catch (error) {
    toast.add({ title: `Something went wrong. ${error}`, color: "error" });
  }
};

defineExpose({
  open: handleOpen,
});
</script>

<template>
  <UModal
    id="serviceModal"
    ref="modalRef"
    :title="isEdit ? 'Edit Service' : 'Create Service'"
    @submit="onFormSubmit"
    :close="{ onClick: () => emit('close', false) }"
    @after:enter="onOpen"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm @submit="onFormSubmit">
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
      </UForm>
    </template>

    <template #footer>
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
  </UModal>
</template>
