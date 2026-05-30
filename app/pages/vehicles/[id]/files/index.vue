<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import FilePreviewModal from "~/components/file/FilePreviewModal.vue";

useHead({
  title: "Files",
});
definePageMeta({
  auth: true,
});

const vehicleId = useRouteParam("id", { type: "number", required: true });
const { data: documents } = useVehicleDocuments(vehicleId.value);

const toast = useToast();
const overlay = useOverlay();

const filePreviewModal = overlay.create(FilePreviewModal);

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
    toast.add({ title: `File ${file.name} not found.`, color: "error" });
    return;
  }

  filePreviewModal.open({
    bucket: "VehicleDocuments",
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
    toast.add({
      title: `Failed to download file`,
      description: JSON.stringify(error),
      color: "error",
    });
  }
};

const handleFileDelete = async (file: File) => {
  if (!vehicleId.value) return;
  const fileToDelete = documents.value?.find(
    ({ name, file_size }) =>
      name === file.name && (file_size || 0) === file.size,
  );
  if (!fileToDelete) return;

  const deleteToast = toast.add({
    title: `Deleting ${fileToDelete.name}...`,
    color: "info",
    duration: 0,
  });

  try {
    await deleteVehicleDocument(
      vehicleId.value,
      fileToDelete.id,
      fileToDelete.file_path,
    );

    toast.update(deleteToast.id, {
      title: `Deleted ${fileToDelete.name} successfully!`,
      color: "success",
      duration: 3000,
    });

    files.value = files.value.filter(
      (f) => f.name !== file.name && f.size !== file.size,
    );
  } catch (error) {
    console.error(error);

    toast.update(deleteToast.id, {
      title: `Failed to delete ${fileToDelete.name}.`,
      color: "error",
      duration: 5000,
    });
  }
};

const uploadFiles = async (files: File[]) => {
  if (!vehicleId.value) return;
  if (files.length === 0) return;

  const pluralFile = pluralize(files.length, "file");

  const uploadPromises = files.map(async (file) => {
    const data = await uploadVehicleDocument(vehicleId.value!, file);

    return data;
  });

  const uploadToast = toast.add({
    title: `Uploading ${pluralFile}...`,
    color: "info",
    duration: 0,
  });

  try {
    await Promise.all(uploadPromises);

    toast.update(uploadToast.id, {
      title: `Successfully uploaded ${pluralFile}!`,
      color: "success",
      duration: 3000,
    });
  } catch (error: unknown) {
    console.error(error);
    toast.update(uploadToast.id, {
      title: `Failed to upload file.\n${(error as { message: string })?.message}`,
      color: "error",
      duration: 5000,
    });
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
  const fileGridActions: DropdownMenuItem[] | DropdownMenuItem[][] = [
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
    <UFileUpload
      label="Click to upload or drag & drop"
      class="mb-2"
      description="Max 5MB"
      multiple
      fileIcon="mdi:file"
      v-model="files"
      layout="list"
    >
      <template #file-name="{ file }">
        <span class="link-hover truncate" @click="handleFilePreview(file)">
          {{ file.name }}
        </span>
      </template>

      <template #file-trailing="{ file }">
        <div class="grow"></div>

        <ResponsiveMenu :items="generateFileGridActions(file)">
          <UButton icon="mdi:dots-vertical" variant="ghost" color="neutral" />
        </ResponsiveMenu>
      </template>
    </UFileUpload>

    <LazyUEmpty
      icon="mdi:file"
      title="No files found"
      description="It looks like you haven't added any files. Upload one to get started."
    />
  </div>
</template>
