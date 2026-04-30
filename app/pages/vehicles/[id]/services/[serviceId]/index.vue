<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import FilePreviewModal from "~/components/file/FilePreviewModal.vue";
import ServiceDialog from "~/components/vehicle/service/dialog/ServiceDialog.vue";
import { deleteVehicleDocument } from "~/composables/vehicle/useVehicleDocuments";

useHead({
  title: "Service",
});

definePageMeta({
  auth: true,
  layout: "vehicle",
});

const vehicleId = useRouteParam("id", "number");
const serviceId = useRouteParam("serviceId", "number");

const { data: service, pending: loading } = await useVehicleService(
  vehicleId.value,
  serviceId.value,
);

const { data: vehicle } = useVehicle(vehicleId.value);

const toast = useToast();
const overlay = useOverlay();
const confirm = useConfirmDialog();

const vehicleServiceDialog = overlay.create(ServiceDialog);
const filePreviewDialog = overlay.create(FilePreviewModal);

const serviceInsights = ref<
  | {
      previous_date: string;
      previous_mileage: number;
      avg_interval: number;
      type: string;
    }
  | undefined
>(undefined);

const getServiceInsights = async () => {
  if (!serviceId.value) return;

  const client = useSupabaseClient();
  const { data, error } = await client.rpc("get_service_insights", {
    vehicle_id: vehicleId.value,
    service_log_id: serviceId.value,
  });

  if (error) {
    toast.add({ title: "Failed to fetch service insights", color: "error" });
    return null;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return;
  }

  serviceInsights.value = data[0];
};

const handleServiceDelete = async () => {
  if (!vehicleId.value) return;
  if (!service.value) return;

  const result = await confirm({
    title: "Delete Service?",
    description:
      "Are you sure you want to delete this service? This cannot be undone.",
    button: {
      label: "Delete",
      color: "error",
    },
  });

  if (!result) return;

  const deleteToast = toast.add({
    title: `Deleting Service...`,
    color: "info",
    duration: 0,
  });
  try {
    await deleteVehicleService(vehicleId.value, service.value.id);
    toast.update(deleteToast.id, {
      title: `Successfully deleted Service!`,
      color: "success",
      duration: 3000,
    });
  } catch (error) {
    toast.update(deleteToast.id, {
      title: `Failed to delete service`,
      color: "error",
      duration: 5000,
    });
  }

  navigateTo({
    name: "vehicles-id-services",
    params: { id: vehicleId.value },
  });
};

const handleFilePreview = async (file: File) => {
  const fileToPreview = service.value?.files?.find(
    ({ name }) => name === file.name,
  );
  if (!fileToPreview) return;
  if (!fileToPreview.file_path) return;

  filePreviewDialog.open({
    bucket: "VehicleDocuments",
    path: fileToPreview.file_path,
  });
};

const handleFileDownload = async (file: File) => {
  try {
    const fileToPreview = service.value?.files?.find(
      ({ name }) => name === file.name,
    );
    if (!fileToPreview) return;
    if (!fileToPreview.file_path) return;

    const client = useSupabaseClient();
    const { data, error } = await client.storage
      .from("VehicleDocuments")
      .download(fileToPreview.file_path);
    if (error) throw error;

    downloadBlob(data, file?.name || "file");
  } catch (error) {
    console.error(error);
    toast.add({ title: `Failed to download file`, color: "error" });
  }
};

const handleFileDelete = async (file: File) => {
  const fileToDelete = service.value?.files?.find(
    ({ name }) => name === file.name,
  );
  if (!fileToDelete) return;
  if (!fileToDelete.file_path) return;

  await deleteVehicleDocument(
    fileToDelete.vehicle_id,
    fileToDelete.id,
    fileToDelete.file_path,
  );

  toast.add({
    title: `Successfully deleted file '${file.name}'`,
    color: "success",
  });
};

const addCalendarEvent = () => {
  if (!service.value) return;

  const event = {
    title: service.value.type,
    description: service.value.notes,
    location: service.value.provider,
    startDate: new Date(service.value.date),
    endDate: new Date(service.value.date),
  };

  generateICSFile(event);
};

const generateFileGridActions = (file: File) => {
  const fileGridActions: DropdownMenuItem[] = [
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
    {
      type: "label",
      label: "Delete",
      icon: "mdi:trash",
      color: "error",
      onClick: () => handleFileDelete(file),
    },
  ];

  return fileGridActions;
};

const handleEditService = () => {
  if (!vehicleId.value) return;

  vehicleServiceDialog.open({
    vehicleId: vehicleId.value,
    serviceId: serviceId.value,
  });
};

const files = computed(
  () =>
    service.value?.files.map(
      (file) => new File([], file?.name || "", { type: "file" }),
    ) || [],
);

onMounted(() => {
  getServiceInsights();
});
</script>

<template>
  <div>
    <NuxtLink
      :to="{
        name: 'vehicles-id-services',
        params: { id: useRouteParam('id').value },
      }"
      class="link flex items-center gap-2 mb-2"
    >
      <Icon name="mdi:chevron-left" />
      Back to Services
    </NuxtLink>

    <!-- <SkeletonLoader v-if="loading" /> -->

    <UPageCard
      v-if="service"
      variant="soft"
      :ui="{ header: 'w-full flex justify-between gap-3', body: 'w-full' }"
    >
      <template #header>
        <div class="text-base text-pretty font-semibold text-highlighted">
          {{ service.type }}
        </div>

        <div class="flex gap-1">
          <LazyUButton
            v-if="new Date(service.date) > new Date()"
            label="Add Reminder"
            icon="mdi:calendar"
            variant="outline"
            color="neutral"
            @click="addCalendarEvent()"
          />

          <ResponsiveMenu
            :items="[
              {
                label: 'Edit',
                icon: 'mdi:pencil',
                onClick: handleEditService,
              },
              {
                label: 'Delete',
                icon: 'mdi:trash',
                color: 'error',
                onClick: handleServiceDelete,
              },
            ]"
          >
            <UButton
              icon="mdi:dots-vertical"
              variant="outline"
              color="secondary"
            />
          </ResponsiveMenu>
        </div>
      </template>
      <template #body>
        <UPageList>
          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Date:</span>
            <NuxtTime
              :datetime="service.date"
              dateStyle="long"
              timeStyle="short"
            />
          </div>

          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Provider:</span>
            <span>
              {{ service.provider }}
            </span>
          </div>

          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Mileage:</span>
            <span>
              {{
                formatNumber(service.mileage || 0, {
                  style: "unit",
                  unit: vehicle?.mileage_unit || "kilometer",
                  compactDisplay: "short",
                })
              }}
            </span>
          </div>

          <div class="inline-flex gap-1 items-center">
            <span class="font-semibold">Cost:</span>
            <span>
              {{
                formatNumber(service.totalCost || 0, {
                  style: "currency",
                  currency: service.currency || "EUR",
                  currencyDisplay: "narrowSymbol",
                  compactDisplay: "short",
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 0,
                })
              }}
            </span>
          </div>

          <div v-if="serviceInsights" class="inline-flex gap-1 items-center">
            <span class="font-semibold">Last {{ service.type }}:</span>
            <span>
              {{
                formatNumber(
                  (service.mileage || 0) - serviceInsights.previous_mileage,
                  {
                    style: "unit",
                    unit: vehicle?.mileage_unit || "kilometer",
                    compactDisplay: "short",
                  },
                )
              }}
              ago
            </span>
            <span
              class="w-1 h-1 bg-neutral-content rounded-full inline-block leading-none mx-1"
            ></span>
            <NuxtTime
              v-if="serviceInsights.previous_date"
              relative
              :datetime="serviceInsights.previous_date"
              numeric="always"
              relativeStyle="long"
              year="2-digit"
              month="2-digit"
            />
          </div>
        </UPageList>

        <UCard class="mt-5">
          <LazyVehicleServiceDialogComponentsItemsTable
            v-if="serviceId != null && vehicleId != null"
            v-model="service"
            v-model:serviceItems="service.items"
            :allowEdit="false"
          />
        </UCard>

        <!-- TODO: find solution -->
        <!-- <UFileUpload
          class="mt-5"
          layout="grid"
          position="inside"
          multiple
          :ui="{
            base: 'min-h-48',
          }"
          :modelValue="files"
        /> -->
        <FileGrid :files="files" class="mt-5">
          <template #actions="{ file }">
            <UDropdownMenu :items="generateFileGridActions(file as File)">
              <UButton
                icon="mdi:dots-vertical"
                variant="ghost"
                color="neutral"
              />
            </UDropdownMenu>
          </template>
        </FileGrid>
      </template>
    </UPageCard>
  </div>
</template>
