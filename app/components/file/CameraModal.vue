<script setup lang="ts">
const emit = defineEmits<{
  close: [blob?: Blob];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

const toast = useToast();

const {
  selectedDeviceId,
  devices,
  error,
  hasTakenPicture,
  isLoading,
  previewUrl,
  startCamera,
  stopCamera,
  restartCamera,
  reset,
  capture,
  getBlob,
} = useCamera(videoRef);

const submitPicture = async () => {
  const blob = getBlob();
  if (!blob) {
    toast.add({
      title: "No picture taken yet. Please try again.",
      color: "error",
    });
    return;
  }

  emit("close", blob);
};

const onOpen = () => {
  startCamera();
};

const onClose = () => {
  stopCamera();
};

onUnmounted(stopCamera);
</script>

<template>
  <UModal
    title="Camera"
    @after:enter="onOpen"
    @after:leave="onClose"
    :close="{ onClick: () => emit('close') }"
  >
    <template #body>
      <div
        class="relative flex items-center justify-center aspect-video mb-2 min-h-20"
      >
        <video
          v-if="!error"
          ref="videoRef"
          autoplay
          playsinline
          class="w-full h-full rounded-md border border-neutral"
          style="transform: scale(-1, 1)"
          v-show="!hasTakenPicture"
        ></video>

        <img
          v-if="previewUrl && hasTakenPicture"
          :src="previewUrl"
          class="w-full h-full rounded-md border border-neutral object-contain"
        />

        <div
          class="absolute inset-0 skeleton w-full h-full rounded-md flex items-center justify-center"
          v-if="isLoading"
        >
          Starting camera...
        </div>

        <UEmpty
          class="w-full h-full"
          v-if="error"
          :title="error"
          :actions="[
            {
              label: 'Refresh',
              icon: 'mdi:refresh',
              color: 'neutral',
              variant: 'subtle',
              onClick: restartCamera,
            },
          ]"
        />
      </div>
    </template>

    <template #footer>
      <UButton
        label="Cancel"
        variant="outline"
        color="neutral"
        class="me-auto"
        @click="emit('close')"
      />

      <USelect
        v-if="devices.length > 0"
        v-model="selectedDeviceId"
        :items="devices"
        valueKey="deviceId"
        @change="restartCamera"
      />

      <UButton
        v-if="hasTakenPicture"
        label="Try Again"
        variant="outline"
        color="neutral"
        @click="reset"
      />
      <UButton v-else icon="mdi:camera" @click="capture()" />

      <UButton v-if="hasTakenPicture" label="Save" @click="submitPicture" />
    </template>
  </UModal>
</template>
