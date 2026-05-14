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

const overlay = useOverlay();

const filePreviewModal = overlay.create(FilePreviewModal);
const cameraModal = overlay.create(CameraModal);

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

const handleTakePicture = async () => {
  const instance = cameraModal.open();
  const picture = await instance.result;
  if (!picture) return;

  handlePictureUpload(picture);
};

const handleFilePreview = (file: File) => {
  const fileToPreview = files.value?.find(({ name }) => name === file.name);
  if (!fileToPreview) return;

  filePreviewModal.open({
    bucket: "VehicleDocuments",
    src: URL.createObjectURL(fileToPreview),
  });
};
</script>

<template>
  <UFileUpload
    class="w-full mt-3"
    v-model="files"
    multiple
    accept="*"
    label="Click to upload or drag & drop"
    description="Max 5MB"
    :maxSize="5242880"
    fileIcon="mdi:file"
  >
    <template #file-name="{ file }">
      <span class="link-hover truncate" @click="handleFilePreview(file)">
        {{ file.name }}
      </span>
    </template>
    <template #actions>
      <UButton
        label="Add Picture"
        icon="mdi:camera"
        variant="outline"
        class="mt-3"
        @click.stop="handleTakePicture"
      />
    </template>
  </UFileUpload>
</template>
