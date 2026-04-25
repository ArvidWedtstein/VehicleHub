<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

interface ConfirmDialogProps {
  title?: string;
  description?: string;

  button?: Omit<ButtonProps, "size" | "onClick">;
}

const {
  button = {
    label: "Confirm",
    color: "neutral",
  },
} = defineProps<ConfirmDialogProps>();

const emits = defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal
    :title="title"
    :description="description"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        @click="emits('close', false)"
      />
      <UButton v-bind="button" @click="emits('close', true)" />
    </template>
  </UModal>
</template>
