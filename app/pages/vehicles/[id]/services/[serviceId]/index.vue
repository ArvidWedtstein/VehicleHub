<script setup lang="ts">
import type { MenuItem } from "~/components/menu/Menu.vue";
import ServiceDialog from "~/components/vehicle/service/dialog/ServiceDialog.vue";
import { deleteVehicleDocument } from "~/features/vehicles/documents/useVehicleDocuments";
import {
  deleteVehicleService,
  useVehicleService,
} from "~/features/vehicles/services/useVehicleServices";
import { useVehicle } from "~/features/vehicles/useVehicles";

useHead({
  title: "Service",
});

definePageMeta({
  auth: true,
  layout: "vehicle",
});

const FilePreviewModal = defineAsyncComponent(
  async () => await import("~/components/file/FilePreviewModal.vue"),
);

const vehicleId = useRouteParam("id", "number");
const serviceId = useRouteParam("serviceId", "number");

const { data: service, pending: loading } = await useVehicleService(
  vehicleId.value,
  serviceId.value,
);

const { data: vehicle } = useVehicle(vehicleId.value);

const overlay = useOverlay();
const vehicleServiceDialog = overlay.create(ServiceDialog);

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
    toast.error("Failed to fetch service insights");
    return null;
  }

  console.log("Service insights:", data);
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return;
  }

  serviceInsights.value = data[0];
};

const filePreviewRef = ref<InstanceType<typeof FilePreviewModal>>();

const handleServiceDelete = async () => {
  if (!vehicleId.value) return;
  if (!service.value) return;

  const result = await useConfirm({
    title: "Delete Service?",
    message:
      "Are you sure you want to delete this service? This cannot be undone.",
    confirmLabel: "Delete",
    severity: "danger",
  });

  if (!result) return;

  const deletePromise = deleteVehicleService(vehicleId.value, service.value.id);
  toast.promise(deletePromise, {
    loading: `Deleting Service...`,
    success: `Successfully deleted Service!`,
    error: `Failed to delete Service.`,
  });

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
  filePreviewRef.value?.open({ path: fileToPreview.file_path });
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
    toast.error(`Failed to download file`);
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

  toast.success(`Successfully deleted file '${file.name}'`);
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
  const fileGridActions: MenuItem[] = [
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

onMounted(() => {
  getServiceInsights();
});
</script>

<template>
  <div>
    <FilePreviewModal bucket="VehicleDocuments" ref="filePreviewRef" />

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

    <div
      v-if="service"
      :key="service.id"
      class="card card-border card-sm md:card-side bg-base-100 shadow-xl"
    >
      <div class="card-body">
        <div class="flex justify-between w-full">
          <h2 class="card-title">{{ service.type }}</h2>

          <div class="flex gap-1">
            <template v-if="new Date(service.date) > new Date()">
              <button
                type="button"
                class="btn btn-sm btn-outline btn-neutral"
                @click="addCalendarEvent()"
              >
                <Icon name="mdi:calendar" />
                Add Reminder
              </button>

              <div class="divider divider-horizontal mx-1"></div>
            </template>

            <ResponsiveMenu
              alignMenu="end"
              :items="[
                {
                  label: 'Edit',
                  icon: 'mdi:pencil',
                  onClick: handleEditService,
                },
                {
                  label: 'Delete',
                  icon: 'mdi:trash',
                  class: 'text-error',
                  onClick: handleServiceDelete,
                },
              ]"
              #default="{ toggle }"
            >
              <button
                type="button"
                class="btn btn-sm btn-outline btn-secondary"
                @click="toggle()"
              >
                <Icon name="mdi:dots-vertical" />
              </button>
            </ResponsiveMenu>
          </div>
        </div>

        <ul class="flex flex-col gap-1 text-sm">
          <li v-if="serviceInsights" class="inline-flex gap-1 items-center">
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
          </li>
          <li class="inline-flex gap-1 items-center">
            <span class="font-semibold">Date:</span>
            <span>
              {{
                formatDate(service.date, {
                  dateStyle: "long",
                  timeStyle: "short",
                })
              }}
            </span>
          </li>
          <li class="inline-flex gap-1 items-center">
            <span class="font-semibold">Provider:</span>
            <span>
              {{ service.provider }}
            </span>
          </li>
          <li class="inline-flex gap-1 items-center">
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
          </li>
          <li class="inline-flex gap-1 items-center">
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
          </li>
        </ul>

        <div class="divider my-0"></div>

        <template v-if="service.notes">
          <p class="text-sm">{{ service.notes }}</p>

          <div class="divider my-0"></div>
        </template>

        <Suspense>
          <LazyVehicleServiceDialogComponentsItemsTable
            v-if="serviceId != null && vehicleId != null"
            v-model="service"
            v-model:serviceItems="service.items"
            :allowEdit="false"
          />
          <template #fallback>
            <div class="flex justify-center">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          </template>
        </Suspense>

        <div class="divider my-0"></div>

        <span class="font-semibold text-sm">Attachments:</span>

        <FileGrid
          :files="
            service.files.map(({ name, file_size }) => ({
              name: name || '',
              size: file_size || 0,
            }))
          "
        >
          <template #actions="{ file }">
            <Menu
              alignMenu="end"
              :items="generateFileGridActions(file as File)"
              #default="{ toggle }"
            >
              <button
                type="button"
                class="btn btn-sm btn-ghost"
                @click="toggle()"
              >
                <Icon name="mdi:dots-vertical" />
              </button>
            </Menu>
          </template>
        </FileGrid>
      </div>
    </div>
  </div>
</template>
