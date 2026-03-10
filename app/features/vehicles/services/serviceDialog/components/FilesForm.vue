<script setup lang="ts">
import DropArea from "~/components/file/DropArea.vue";
import { deleteVehicleDocument } from "~/features/vehicles/documents/useVehicleDocuments";
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

const handleFileUpload = async (uploadedFiles: Array<File>) => {
  files.value = [...files.value, ...uploadedFiles];
};

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

// TODO: fix
const handleFileDelete = (file: File) => {
  //   const documentFile = service.value.find(
  //     document =>
  //       document.name === file.name &&
  //       document.file_size === file.size &&
  //       document.service_log_id === service.value.id,
  //   );

  files.value = files.value.filter(
    (uploadedFile) =>
      uploadedFile.name !== file.name && uploadedFile.size !== file.size,
  );

  //   if (documentFile) {
  //     toast.promise(
  //       () => deleteVehicleDocument(service.value.vehicle_id!, documentFile.id),
  //       {
  //         loading: `Deleting file ${file.name}...`,
  //         success: `Successfully deleted file ${file.name}`,
  //         error: `Failed to delete file ${file.name}`,
  //       },
  //     );

  //     return;
  //   }

  toast.success(`Successfully deleted file ${file.name || ""}`);
};
</script>

<template>
  <FilePreviewModal bucket="VehicleDocuments" ref="filePreviewRef" />
  <CameraModal ref="cameraModalRef" @pictureTaken="handlePictureUpload" />

  <DropArea @upload="handleFileUpload" class="mt-3">
    <button
      type="button"
      class="btn btn-sm btn-outline mb-3"
      @click="cameraModalRef?.open()"
    >
      <Icon name="mdi:camera" />
      Add Picture
    </button>

    <FileAreaInput @upload="handleFileUpload" />

    <FileGrid class="mt-2" :files="files">
      <template #actions="{ file }">
        <Menu btnClass="btn btn-sm btn-ghost m-1" alignMenu="end">
          <svg
            class="size-[1.2em] fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path
              d="M120 256c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm160 0c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm104 56c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56z"
            />
          </svg>
          <template #items>
            <MenuItem @click="handleFilePreview(file as File)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                class="size-[1.2em] fill-current"
              >
                <path
                  d="M320 464c8.8 0 16-7.2 16-16l0-288-80 0c-17.7 0-32-14.3-32-32l0-80L64 48c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16l256 0zM0 64C0 28.7 28.7 0 64 0L229.5 0c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64z"
                />
              </svg>
              Preview
            </MenuItem>
            <MenuItem @click="handleFileDelete(file as File)">
              <Icon name="mdi:trash" />
              Delete
            </MenuItem>
          </template>
        </Menu>
      </template>
    </FileGrid>
  </DropArea>
</template>
