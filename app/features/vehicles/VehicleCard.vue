<script setup lang="ts">
import type { Tables } from "~/types/supabase";
import { useProfiles } from "../profiles/useProfiles";
import ChangelogDrawer from "./vehicleChangelog/ChangelogDrawer.vue";
import { useVehicle } from "./useVehicles";

const VehicleDialog = defineAsyncComponent(
  () => import("./vehicleDialog/VehicleDialog.vue"),
);

const ShareVehicleDialog = defineAsyncComponent(
  () => import("./shareVehicleDialog/ShareVehicleDialog.vue"),
);

const vehicleDialogRef = ref<InstanceType<typeof VehicleDialog> | null>(null);
const shareVehicleDialogRef = ref<InstanceType<
  typeof ShareVehicleDialog
> | null>(null);

const changelogDrawerRef = ref<InstanceType<typeof ChangelogDrawer>>();

const vehicleId = useRouteParam("id", "number");
const { data: vehicle } = useVehicle(vehicleId.value);

const { data: profiles } = useProfiles();
const profilesMap = computed(() => {
  const map = new Map();
  profiles.value?.forEach((p) => map.set(p.user_id, p));
  return map;
});

const currentVehicleOwner = computed(() => {
  return profilesMap.value.get(vehicle.value?.owner_user_id);
});

const overlay = useOverlay();

const vehicleModal = overlay.create(VehicleDialog);

const editVehicle = () => {
  if (!vehicleId.value) return;

  vehicleModal.open({ vehicleId: vehicleId.value });
};

const openShareVehicleDialog = async () => {
  if (!vehicleId.value) return;
  shareVehicleDialogRef.value?.open(vehicleId.value);
};

const openChangelogDrawer = () => {
  changelogDrawerRef.value?.open();
};
</script>

<template>
  <div v-if="vehicle" class="card image-full card-border bg-base-200 shrink">
    <VehicleDialog ref="vehicleDialogRef" />

    <!-- Hydration mismatch-->
    <ClientOnly>
      <ChangelogDrawer ref="changelogDrawerRef" :vehicleId="vehicle.id" />
    </ClientOnly>

    <ShareVehicleDialog ref="shareVehicleDialogRef" />

    <figure>
      <img
        v-if="vehicle.thumbnail"
        :src="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}`"
        alt="Car"
        class="object-cover max-h-64 grow"
      />
    </figure>
    <div class="card-body">
      <NuxtLink :to="{ name: 'vehicles' }" class="link flex items-center gap-2">
        <Icon name="mdi:chevron-left" size="1.2em" />
        Back to Vehicles
      </NuxtLink>
      <div class="flex justify-between items-center gap-6">
        <h2 class="card-title mb-0! text-nowrap">
          {{
            [`${vehicle.make} ${vehicle.model}`, vehicle.model_year]
              .filter(Boolean)
              .join(", ")
          }}
        </h2>

        <div class="flex justify-end items-center gap-1">
          <UButton
            label="Edit"
            variant="soft"
            color="neutral"
            icon="mdi:pencil"
            @click="editVehicle"
          />

          <UButton
            label="Changelog"
            variant="soft"
            color="neutral"
            icon="mdi:history"
            @click="openChangelogDrawer"
          />

          <!-- TODO: finish-->
          <!-- <button
            type="button"
            class="btn btn-sm btn-neutral btn-outline"
            title="Transfer ownership"
          >
            Transfer ownership
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              class="size-[1.2em] fill-current"
            >
              <path
                d="M455.703 18.748C443.209 6.252 426.829 0 410.452 0C394.07 0 377.695 6.25 365.196 18.75L45.11 338.885C36.542 347.451 30.584 358.275 27.926 370.094L0.319 492.854C-1.701 502.967 6.158 512 15.946 512C16.993 512 18.061 511.896 19.143 511.68C19.143 511.68 103.751 493.73 141.894 484.748C153.432 482.031 163.759 476.225 172.139 467.844C221.264 418.719 406.649 233.33 493.302 146.676C518.294 121.684 518.202 81.256 493.212 56.262L455.703 18.748ZM138.201 433.902C136.086 436.018 133.697 437.365 130.893 438.025C112.719 442.307 83.432 448.738 58.204 454.203L74.751 380.627C75.417 377.668 76.902 374.973 79.048 372.824L320.936 130.902L381.064 191.035L138.201 433.902Z"
              />
            </svg>
          </button> -->

          <UButton
            label="Share"
            variant="soft"
            color="secondary"
            icon="mdi:share-variant"
            @click="openShareVehicleDialog"
          />
        </div>
      </div>

      <div class="-mt-1 text-neutral-content flex gap-1 items-center">
        <span v-show="vehicle.engine_displacement">
          {{
            formatNumber(vehicle.engine_displacement, {
              style: "unit",
              unit: vehicle.engine_displacement_unit || "liter",
              unitDisplay: "short",
            })
          }}
        </span>
        <span>{{ vehicle.body_type }}</span>
        <div
          class="w-1 h-1 bg-neutral-content rounded-full inline-block leading-none mx-1"
        ></div>

        <span class="flex gap-1">
          <Icon
            :name="
              vehicle.fuel_type === 'Electric' ? 'mdi:car-electric' : 'mdi:car'
            "
            size="1.2em"
          />

          {{ vehicle.fuel_type }}

          ({{
            formatNumber(vehicle.fuel_capacity, {
              style: "unit",
              unit: vehicle.fuel_capacity_unit || "liter",
              unitDisplay: "short",
            })
          }})
        </span>
      </div>

      <div
        class="flex gap-1 items-center"
        v-if="currentVehicleOwner && currentVehicleOwner?.id"
      >
        <span>Owner:</span>
        <span
          class="tooltip"
          :data-tip="currentVehicleOwner?.name || 'Unknown'"
        >
          <AvatarImage
            size="xxs"
            :src="currentVehicleOwner?.profile_image_url"
            :alt="currentVehicleOwner.name"
            :fallbackSrc="`https://ui-avatars.com/api/?name=${currentVehicleOwner.name || 'Unknown'}`"
          />
        </span>

        {{ currentVehicleOwner?.name }}
      </div>

      <div
        v-show="vehicle.shares && vehicle.shares?.length > 0"
        class="flex gap-1 items-center"
      >
        <span class="">Shared with:</span>
        <div class="avatar-group -space-x-2 rtl:space-x-reverse">
          <span v-for="share in vehicle.shares" :key="share.id">
            <AvatarImage
              size="xxs"
              :src="profilesMap.get(share.user_id)?.profile_image_url"
              :fallbackSrc="`https://ui-avatars.com/api/?name=${
                profilesMap.get(share.user_id)?.name
              }`"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
