<script setup lang="ts">
import type Modal from "../Modal.vue";

const modalRef = ref<InstanceType<typeof Modal> | null>(null);
const emit = defineEmits<{
  pictureTaken: [blob: Blob];
}>();

const video = ref<HTMLVideoElement | null>(null);
const imageCanvas = ref<HTMLCanvasElement | null>(null);

type CameraState = {
  stream: MediaStream | null;
  hasTakenPicture: boolean;
};
const cameraState = reactive<CameraState>({
  stream: null,
  hasTakenPicture: false,
});

const initCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (!video.value) {
      console.log("Video element not found");
      return;
    }

    video.value.srcObject = stream;
    video.value.play();

    cameraState.stream = stream;
  } catch (error) {
    console.error("Error accessing the camera: ", error);
  }
};

const captureImage = () => {
  if (!imageCanvas.value) return;
  const context = imageCanvas.value.getContext("2d");

  if (!context) return;
  if (!video.value) return;

  imageCanvas.value.width = video.value.videoWidth;
  imageCanvas.value.height = video.value.videoHeight;

  context.drawImage(
    video.value,
    0,
    0,
    imageCanvas.value.width,
    imageCanvas.value.height
  );

  video.value.pause();
  cameraState.hasTakenPicture = true;
};

const resetPicture = () => {
  if (!video.value) return;

  video.value.play();
  cameraState.hasTakenPicture = false;
};

const submitPicture = () => {
  if (!imageCanvas.value) return;

  imageCanvas.value.toBlob((blob) => {
    if (!blob) return;
    emit("pictureTaken", blob);
  });

  modalRef.value?.modalRef?.close();
};

const handleOpen = async () => {
  await modalRef.value?.modalRef?.showModal();

  await nextTick();
  await initCamera();
};

onUnmounted(() => {
  if (cameraState.stream) {
    cameraState.stream.getTracks().forEach((track) => track.stop());
  }
});

defineExpose({
  modalRef,
  open: handleOpen,
  close: () => {
    modalRef.value?.modalRef?.close();
  },
});
</script>

<template>
  <Modal id="cameraModal" ref="modalRef" title="Camera" @close="resetPicture">
    <div class="relative">
      <video
        ref="video"
        autoplay
        class="w-full h-full rounded-md border border-neutral"
        :class="[cameraState.hasTakenPicture ? 'hidden' : '']"
      ></video>
      <canvas
        ref="imageCanvas"
        class="w-full h-full rounded-md border border-neutral"
        :class="[cameraState.hasTakenPicture ? '' : 'hidden']"
      ></canvas>
    </div>

    <template #actions>
      <button
        class="btn btn-outline mt-2 me-auto float-start"
        value="cancel"
        formmethod="dialog"
        formnovalidate
      >
        Cancel
      </button>

      <button
        v-if="cameraState.hasTakenPicture"
        class="btn btn-outline btn-secondary mt-2"
        @click="resetPicture"
      >
        Try Again
      </button>
      <button v-else class="btn btn-primary mt-2" @click="captureImage">
        Capture
      </button>
      <button
        v-if="cameraState.hasTakenPicture"
        class="btn btn-primary mt-2"
        @click="submitPicture"
      >
        Ok
      </button>
    </template>
  </Modal>
</template>
