<script setup lang="ts">
import type { TablesInsert, TablesUpdate } from "~/types/supabase";

const FilePreviewModal = defineAsyncComponent(
  async () => await import("~/components/file/FilePreviewModal.vue"),
);
const CameraModal = defineAsyncComponent(
  async () => await import("~/components/file/CameraModal.vue"),
);

const service = defineModel<
  TablesInsert<"VehicleServiceLogs"> | TablesUpdate<"VehicleServiceLogs">
>({ required: true });

const files = defineModel<Array<File>>("files", {
  required: false,
  default: () => [],
});

const filePreviewRef = ref<InstanceType<typeof FilePreviewModal>>();
const cameraModalRef = ref<InstanceType<typeof CameraModal>>();

const handlePictureUpload = async (picture: Blob) => {
  const extension = mimeToExtension(picture.type);

  const fileName = service.value.id
    ? `service_${service.value.id}_${new Date().toISOString()}.${extension}`
    : `service_${new Date().toISOString()}.${extension}`;

  const file = new File([picture], fileName, {
    type: picture.type,
  });

  files.value = [...files.value, file];
};

const handleFilePreview = (file: File) => {
  const fileToPreview = files.value?.find(({ name }) => name === file.name);
  if (!fileToPreview) return;

  filePreviewRef.value?.open({ src: URL.createObjectURL(fileToPreview) });
};
</script>

<template>
  <FilePreviewModal bucket="VehicleDocuments" ref="filePreviewRef" />
  <CameraModal ref="cameraModalRef" @pictureTaken="handlePictureUpload" />

  <FileUpload
    class="w-full mt-3"
    v-model="files"
    multiple
    accept="image/*"
    label="Click to upload or drag & drop"
    description="Max 5MB"
    :maxSize="5242880"
    fileIcon="mdi:file"
  >
    <template #fileName="{ file }">
      <span class="link-hover truncate" @click="handleFilePreview(file)">
        {{ file.name }}
      </span>
    </template>
    <template #actions>
      <button
        type="button"
        class="btn btn-sm btn-outline mt-3"
        @click.stop="cameraModalRef?.open()"
      >
        <Icon name="mdi:camera" />
        Add Picture
      </button>
    </template>
  </FileUpload>
</template>
