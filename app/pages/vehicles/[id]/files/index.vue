<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import FilePreviewModal from "~/components/file/FilePreviewModal.vue";

useHead({
  title: "Files",
});
definePageMeta({
  auth: true,
});

const BUCKET = "VehicleDocuments";
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

const vehicleId = useRouteParam("id", { type: "number", required: true });
const { data: documents, refresh } = useVehicleDocuments(vehicleId, [
  { column: "service_log_id", operator: "is", value: null },
]);

const client = useSupabaseClient();
const toast = useToast();
const overlay = useOverlay();
const filePreviewModal = overlay.create(FilePreviewModal);

const files = computed(() => documents.value ?? []);
type StoredFile = (typeof files.value)[number];

const selected = ref<File[]>([]);
const uploading = ref(false);

async function onPick(picked: File[] | null | undefined) {
  const list = picked ?? [];
  selected.value = []; // clear the picker right away, it is not the list
  if (!list.length || !vehicleId.value) return;

  const valid = list.filter((file) => {
    if (file.size <= MAX_SIZE) return true;
    toast.add({
      title: `${file.name} is too large`,
      description: `${(file.size / 1024 / 1024).toFixed(1)} MB, the limit is 5 MB per file`,
      color: "error",
    });
    return false;
  });
  if (!valid.length) return;

  uploading.value = true;
  const uploadToast = toast.add({
    title: `Uploading ${pluralize(valid.length, "file")}...`,
    color: "info",
    duration: 0,
  });

  const results = await Promise.allSettled(
    valid.map((file) => uploadVehicleDocument(vehicleId.value, file)),
  );
  const failed = valid.filter((_, i) => results[i]?.status === "rejected");

  await refresh();
  uploading.value = false;

  if (failed.length) {
    toast.update(uploadToast.id, {
      title: `Failed to upload: ${failed.map((f) => f.name).join(", ")}`,
      color: "error",
      duration: 5000,
    });
  } else {
    toast.update(uploadToast.id, {
      title: `Uploaded ${pluralize(valid.length, "file")}!`,
      color: "success",
      duration: 3000,
    });
  }
}

const handlePreview = (doc: StoredFile) => {
  if (!doc.file_path) {
    toast.add({ title: `File ${doc.name} not found.`, color: "error" });
    return;
  }
  filePreviewModal.open({ bucket: BUCKET, path: doc.file_path });
};

const handleDownload = async (doc: StoredFile) => {
  if (!doc.file_path) return;
  try {
    const { data, error } = await client.storage
      .from(BUCKET)
      .download(doc.file_path);
    if (error) throw error;
    downloadBlob(data, doc.name || "file");
  } catch (error) {
    console.error(error);
    toast.add({
      title: "Failed to download file",
      description: (error as { message?: string })?.message,
      color: "error",
    });
  }
};

const handleDelete = async (doc: StoredFile) => {
  if (!vehicleId.value) return;
  if (!confirm(`Delete ${doc.name}?`)) return;

  const deleteToast = toast.add({
    title: `Deleting ${doc.name}...`,
    color: "info",
    duration: 0,
  });

  try {
    await deleteVehicleDocument(vehicleId.value, doc.id, doc.file_path);
    await refresh();
    toast.update(deleteToast.id, {
      title: `Deleted ${doc.name}`,
      color: "success",
      duration: 3000,
    });
  } catch (error) {
    console.error(error);
    toast.update(deleteToast.id, {
      title: `Failed to delete ${doc.name}.`,
      color: "error",
      duration: 5000,
    });
  }
};

const actionsFor = (doc: StoredFile): DropdownMenuItem[][] => [
  [
    {
      label: "Preview",
      icon: "mdi:file",
      onClick: () => handlePreview(doc),
    },
    {
      label: "Download",
      icon: "mdi:download",
      onClick: () => handleDownload(doc),
    },
  ],
  [
    {
      label: "Delete",
      icon: "mdi:trash",
      color: "error",
      onClick: () => handleDelete(doc),
    },
  ],
];

const iconFor = (name?: string | null) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "mdi:file-pdf-box";
  if (ext && ["jpg", "jpeg", "png", "webp"].includes(ext))
    return "mdi:file-image";
  return "mdi:file";
};
</script>

<template>
  <div class="space-y-4">
    <UFileUpload
      v-model="selected"
      multiple
      :accept="ACCEPT"
      :variant="files.length ? 'button' : 'area'"
      :label="files.length ? 'Add files' : 'Upload your first file'"
      description="PDF, JPG, PNG or WebP · max 5 MB per file"
      icon="i-lucide-upload"
      :disabled="uploading"
      :class="files.length ? '' : 'w-full min-h-56'"
      @update:model-value="onPick"
    />

    <ul v-if="files.length" class="divide-y divide-default">
      <li
        v-for="doc in files"
        :key="doc.id"
        class="flex items-center gap-3 py-3"
      >
        <UIcon :name="iconFor(doc.name)" class="size-6 shrink-0 text-muted" />

        <div class="min-w-0 grow">
          <button
            type="button"
            class="block max-w-full truncate text-left hover:underline"
            @click="handlePreview(doc)"
          >
            {{ doc.name }}
          </button>
          <p class="text-xs text-muted">
            {{ formatFileSize(doc.file_size ?? 0) }} ·
            {{ new Date(doc.created_at).toLocaleDateString() }}
          </p>
        </div>

        <ResponsiveMenu :items="actionsFor(doc)">
          <UButton icon="mdi:dots-vertical" variant="ghost" color="neutral" />
        </ResponsiveMenu>
      </li>
    </ul>
  </div>
</template>
