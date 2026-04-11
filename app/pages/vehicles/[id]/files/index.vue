<script setup lang="ts">
import FilePreviewModal from "~/components/file/FilePreviewModal.vue";
import type { MenuItem } from "~/components/menu/Menu.vue";
import {
  deleteVehicleDocument,
  uploadVehicleDocument,
  useVehicleDocuments,
} from "~/features/vehicles/documents/useVehicleDocuments";

useHead({
  title: "Files",
});
definePageMeta({
  auth: true,
  layout: "vehicle",
});

const vehicleId = useRouteParam("id", "number");
const { data: documents } = await useVehicleDocuments(vehicleId.value);

const filePreviewModal = ref<InstanceType<typeof FilePreviewModal> | null>(
  null,
);

const uploadedFiles = computed(() => {
  return documents.value
    ?.filter(({ service_log_id }) => !service_log_id)
    .map(({ name, file_size, created_at, file_path }) => {
      return {
        file: new File([new ArrayBuffer(file_size || 0)], name || "", {
          lastModified: new Date(created_at).getTime(),
        }),
        path: file_path,
      };
    });
});

const files = ref(uploadedFiles.value?.map((p) => p.file as File) || []);

const handleFilePreview = (file: File) => {
  const fileToPreview = documents.value?.find(
    ({ name, file_size }) =>
      name === file.name && (file_size || 0) === file.size,
  );

  if (!fileToPreview || !fileToPreview.file_path) {
    toast.error(`File ${file.name} not found.`);
    return;
  }

  filePreviewModal.value?.open({
    path: fileToPreview.file_path,
  });
};

const handleFileDownload = async (file: File) => {
  try {
    const fileToPreview = uploadedFiles.value?.find(
      ({ file: previewFile }) => previewFile.name === file.name,
    );
    if (!fileToPreview) return;
    if (!fileToPreview.path) return;

    const client = useSupabaseClient();

    const { data, error } = await client.storage
      .from("VehicleDocuments")
      .download(fileToPreview.path);

    if (error) throw error;

    downloadBlob(data, file?.name || "file");
  } catch (error) {
    console.error(error);
    toast.error(`Failed to download file`);
  }
};

const handleFileDelete = async (file: File) => {
  if (!vehicleId.value) return;
  try {
    const fileToDelete = documents.value?.find(
      ({ name, file_size }) =>
        name === file.name && (file_size || 0) === file.size,
    );
    if (!fileToDelete) return;

    const deletePromise = deleteVehicleDocument(
      vehicleId.value,
      fileToDelete.id,
      fileToDelete.file_path,
    );

    toast.promise(
      deletePromise,
      {
        loading: `Deleting ${fileToDelete.name}...`,
        success: `Successfully deleted ${fileToDelete.name}!`,
        error: `Failed to delete ${fileToDelete.name}.`,
      },
      { timeout: 3000 },
    );
    files.value = files.value.filter(
      (f) => f.name !== file.name && f.size !== file.size,
    );
  } catch (error) {
    console.error(error);
  }
};

const uploadFiles = async (files: File[]) => {
  try {
    if (!vehicleId.value) return;
    if (files.length === 0) return;

    const pluralFile = pluralize(files.length, "file");

    const uploadPromises = files.map(async (file) => {
      const data = await uploadVehicleDocument(vehicleId.value!, file);

      return data;
    });

    toast.promise(
      () => Promise.all(uploadPromises),
      {
        loading: `Uploading ${pluralFile}...`,
        success: `Successfully uploaded ${pluralFile}!`,
        error: `Failed to upload ${pluralFile}.`,
      },
      { timeout: 3000 },
    );
  } catch (error: unknown) {
    console.error(error);
    toast.error(
      `Failed to upload file.\n${(error as { message: string })?.message}`,
    );
  }
};

watch(files, (newFiles, oldFiles) => {
  if (newFiles.length === 0) {
    files.value = uploadedFiles.value?.map((p) => p.file as File) || [];
  }

  const newFileNames = newFiles.map((f) => f.name);
  const oldFileNames = oldFiles.map((f) => f.name);
  const addedFiles = newFiles.filter((f) => !oldFileNames.includes(f.name));
  const removedFiles = oldFiles.filter((f) => !newFileNames.includes(f.name));

  if (addedFiles.length > 0) {
    uploadFiles(addedFiles);
  }

  if (removedFiles.length > 0) {
    removedFiles.forEach((file) => handleFileDelete(file));
  }
});

const generateFileGridActions = (file: File) => {
  const fileGridActions: MenuItem[] | MenuItem[][] = [
    [
      {
        type: "label",
        label: "Preview",
        icon: "mdi:file",
        onClick: () => handleFilePreview(file),
      },
      {
        type: "label",
        label: "Download",
        icon: "mdi:download",
        onClick: () => handleFileDownload(file),
      },
    ],
    [
      {
        type: "label",
        label: "Delete",
        icon: "mdi:trash",
        color: "error",
        onClick: () => handleFileDelete(file),
      },
    ],
  ];

  return fileGridActions;
};
</script>
<template>
  <div>
    <FilePreviewModal bucket="VehicleDocuments" ref="filePreviewModal" />

    <FileUpload
      label="Click to upload or drag & drop"
      class="mb-2"
      description="Max 5MB"
      :maxSize="5242880"
      multiple
      fileIcon="mdi:file"
      v-model="files"
    >
      <template #fileName="{ file }">
        <span class="link-hover truncate" @click="handleFilePreview(file)">
          {{ file.name }}
        </span>
      </template>
    </FileUpload>
  </div>
</template>
