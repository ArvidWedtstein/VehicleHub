<script setup lang="ts">
import type { Tables } from "~/types/supabase";
import { useVehicleForm } from "./useVehicleForm";
import type { StepperItem } from "@nuxt/ui";

const { vehicleId } = defineProps<{
  vehicleId?: Tables<"Vehicles">["id"];
}>();

const emit = defineEmits<{ close: [boolean] }>();

const { vehicleSchema, vehicle, isEdit, initialize, save } = useVehicleForm();

const toast = useToast();
const stepper = useTemplateRef("stepper");

const activeStep = ref("general");
const steps: StepperItem[] = [
  {
    title: "General",
    description: "General Vehicle Info",
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
];

const onOpen = () => {
  console.log("Initializing vehicle form with ID:", vehicleId);
  initialize(vehicleId);
};

const onFormSubmit = async () => {
  try {
    await save();

    toast.add({
      title: `Successfully ${vehicle.value.id ? "updated" : "created"} vehicle`,
      color: "success",
    });

    emit("close", true);
  } catch (err) {
    toast.add({
      title: `Something went wrong.${err}`,
      description: `${err}`,
      color: "error",
    });
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
      <UForm
        id="vehicleForm"
        :schema="vehicleSchema"
        :state="vehicle"
        @submit="onFormSubmit"
      >
        <UStepper
          ref="stepper"
          class="my-2 w-full"
          v-model="activeStep"
          :items="steps"
          :ui="{
            description: 'invisible lg:visible',
          }"
        >
          <template #general>
            <VehicleDialogComponentsBasicInfoForm
              :key="vehicle.id"
              v-model="vehicle"
            />
          </template>
          <template #engine>
            <VehicleDialogComponentsEngineForm v-model="vehicle" />
          </template>
          <template #transmission>
            <VehicleDialogComponentsTransmissionForm v-model="vehicle" />
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
        type="submit"
        :label="isEdit ? 'Save' : 'Create'"
        form="vehicleForm"
        color="primary"
        :icon="isEdit ? 'mdi:content-save' : 'mdi:plus'"
        :disabled="!isEdit && !stepper?.hasNext"
      />
    </template>
  </UModal>
</template>
