<script setup lang="ts">
import type { Tables } from "~/types/supabase";
import { useVehicleForm } from "./useVehicleForm";
import BasicInfoForm from "./components/BasicInfoForm.vue";
import EngineForm from "./components/EngineForm.vue";
import TransmissionForm from "./components/TransmissionForm.vue";
import type { StepperItem } from "@nuxt/ui";

const { vehicleId } = defineProps<{
  vehicleId?: Tables<"Vehicles">["id"];
}>();

const emit = defineEmits<{ close: [boolean] }>();

const uploadedDocumentFiles = ref<File[]>([]);

const { vehicle, isEdit, initialize, save } = useVehicleForm();

const stepper = useTemplateRef("stepper");

const activeStep = ref("general");
const steps = ref<StepperItem[]>([
  {
    title: "General",
    slot: "general",
    value: "general",
  },
  {
    title: "Engine",
    icon: "mdi:engine",
    value: "engine",
    slot: "engine",
  },
  {
    title: "Transmission",
    icon: "mdi:car-shift-pattern",
    value: "transmission",
    slot: "transmission",
  },
]);

const onOpen = () => {
  console.log("Initializing vehicle form with ID:", vehicleId);
  initialize(vehicleId);
};

const onFormSubmit = async () => {
  try {
    await save(uploadedDocumentFiles.value);

    toast.success(
      `Successfully ${vehicle.value.id ? "updated" : "created"} vehicle`,
    );

    emit("close", true);
  } catch (err) {
    toast.error(`Something went wrong.${err}`);
  }
};
</script>

<template>
  <UModal
    :title="vehicle.id ? 'Edit Vehicle' : 'Add Vehicle'"
    :close="{ onClick: () => emit('close', false) }"
    @after:enter="onOpen"
    fullscreen
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <form @submit.prevent="onFormSubmit">
        <UStepper
          ref="stepper"
          class="my-2 w-full"
          v-model="activeStep"
          :items="steps"
        >
          <template #general>
            <BasicInfoForm
              :key="vehicle.id"
              v-model="vehicle"
              v-model:files="uploadedDocumentFiles"
            />
          </template>
          <template #engine>
            <EngineForm v-model="vehicle" />
          </template>
          <template #transmission>
            <TransmissionForm v-model="vehicle" />
          </template>
        </UStepper>
      </form>
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
        :disabled="!isEdit && !stepper?.hasNext"
        @click="onFormSubmit"
      />
    </template>
  </UModal>
</template>
