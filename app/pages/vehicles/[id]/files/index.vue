<script setup lang="ts">
import DropArea from "~/components/file/DropArea.vue";
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
  middleware: "auth",
  layout: "vehicle",
});

const vehicleId = useRouteParam("id", "number");
const { data: documents } = await useVehicleDocuments(vehicleId.value);

const filePreviewModal = ref<InstanceType<typeof FilePreviewModal> | null>(
  null,
);

const files = computed(() => {
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
    const fileToPreview = files.value?.find(
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

    await deleteVehicleDocument(vehicleId.value, fileToDelete.id);

    toast.success(`Successfully deleted file ${fileToDelete.name}`);
  } catch (error) {
    console.error(error);
    toast.error(`Failed to delete file ${file.name}.`);
  }
};

const uploadFile = async (files: File[]) => {
  try {
    if (!vehicleId.value) return;
    if (files.length === 0) return;

    const pluralFile = pluralize(files.length, "file");

    const uploadPromises = files.map(async (file) => {
      const data = await uploadVehicleDocument(vehicleId.value!, file);

      return data;
    });

    toast.promise(() => Promise.all(uploadPromises), {
      loading: `Uploading ${pluralFile}...`,
      success: `Successfully uploaded ${pluralFile}!`,
      error: `Failed to upload ${pluralFile}.`,
    });
  } catch (error: unknown) {
    console.error(error);
    toast.error(
      `Failed to upload file.\n${(error as { message: string })?.message}`,
    );
  }
};

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

    <DropArea @upload="uploadFile">
      <FileAreaInput @upload="uploadFile" multiple />

      <FileGrid class="mt-2" :files="files?.map((p) => p.file as File)">
        <template #actions="{ file }">
          <Menu
            btnClass="btn btn-sm btn-ghost m-1"
            :items="generateFileGridActions(file as File)"
          >
            <Icon name="mdi:dots-vertical" size="1.2em" />
          </Menu>
        </template>
      </FileGrid>
    </DropArea>
  </div>
</template>
