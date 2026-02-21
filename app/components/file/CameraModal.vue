<script setup lang="ts">
import type Modal from "../Modal.vue";

const modalRef = ref<InstanceType<typeof Modal> | null>(null);
const emit = defineEmits<{
  pictureTaken: [blob: Blob];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const {
  selectedDeviceId,
  devices,
  error,
  hasTakenPicture,
  isLoading,
  startCamera,
  stopCamera,
  restartCamera,
  reset,
  capture,
} = useCamera(videoRef, canvasRef);

const submitPicture = async () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob) {
    toast.error("Failed to capture the picture. Please try again.");
    return;
  }

  emit("pictureTaken", blob);

  modalRef.value?.modalRef?.close();
};

const open = async () => {
  modalRef.value?.modalRef?.showModal();

  await nextTick();
  await startCamera();
};

const close = () => {
  stopCamera();
  modalRef.value?.modalRef?.close();
};

onUnmounted(stopCamera);

defineExpose({
  modalRef,
  open,
  close,
});
</script>

<template>
  <Modal id="cameraModal" ref="modalRef" title="Camera" @close="close">
    <div class="relative flex items-center justify-center aspect-video mb-2">
      <video
        ref="videoRef"
        autoplay
        playsinline
        class="w-full h-full rounded-md border border-neutral"
        v-show="!hasTakenPicture"
      ></video>
      <canvas
        ref="canvasRef"
        class="rounded-md border border-neutral"
        v-show="hasTakenPicture"
      ></canvas>

      <div
        class="absolute inset-0 skeleton w-full h-full rounded-md flex items-center justify-center"
        v-if="isLoading"
      >
        Starting camera...
      </div>

      <div v-if="error" class="text-error flex items-center justify-center">
        {{ error }}
      </div>
    </div>

    <template #actions>
      <button
        class="btn btn-outline me-auto"
        value="cancel"
        formmethod="dialog"
        formnovalidate
      >
        Cancel
      </button>

      <FormInput
        v-if="devices.length > 0"
        type="select"
        v-model="selectedDeviceId"
        wrapperClass="-mt-1"
        :options="
          devices.map((d) => ({
            label: d.label || 'Unknown Camera',
            value: d.deviceId,
          }))
        "
        @change="restartCamera"
        size="sm"
      />

      <button
        v-if="hasTakenPicture"
        type="button"
        class="btn btn-outline btn-secondary"
        @click="reset"
      >
        Try Again
      </button>
      <button v-else type="button" class="btn btn-primary" @click="capture()">
        <Icon name="mdi:camera" />
      </button>
      <button
        v-if="hasTakenPicture"
        class="btn btn-primary"
        @click="submitPicture"
      >
        Save
      </button>
    </template>
  </Modal>
</template>
