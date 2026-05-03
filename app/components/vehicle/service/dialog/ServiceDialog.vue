<script setup lang="ts">
import type { Tables, TablesUpdate } from "~/types/supabase";
import FilesForm from "./components/FilesForm.vue";
import ServiceForm from "./components/ServiceForm.vue";
import type { StepperItem } from "@nuxt/ui";
import { useServiceForm } from "./useServiceForm";

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
  serviceSchema,
  service,
  serviceFiles,
  serviceItems,
  vehicle,
  isEdit,
  initialize,
  save,
} = useServiceForm();

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

    emit("close", true);
  } catch (error) {
    toast.add({ title: `Something went wrong. ${error}`, color: "error" });
  }
};
</script>

<template>
  <UModal
    :title="isEdit ? 'Edit Service' : 'Create Service'"
    :close="{ onClick: () => emit('close', false) }"
    @after:enter="onOpen"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UForm
        id="serviceForm"
        :schema="serviceSchema"
        :state="service"
        @submit="onFormSubmit"
        loadingAuto
      >
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
        :key="service.id"
        type="submit"
        :label="isEdit ? 'Save' : 'Create'"
        color="primary"
        :icon="isEdit ? 'mdi:content-save' : 'mdi:plus'"
        form="serviceForm"
      />
    </template>
  </UModal>
</template>
