<script setup lang="ts">
import VehicleDialog from "~/components/vehicle/dialog/VehicleDialog.vue";
import VehicleShareDialog from "./share/VehicleShareDialog.vue";
import type { DropdownMenuItem } from "@nuxt/ui";

const changelogDrawerRef = useTemplateRef("changelogDrawerRef");

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
const vehicleShareModal = overlay.create(VehicleShareDialog);

const editVehicle = () => {
  if (!vehicleId.value) return;

  vehicleModal.open({ vehicleId: vehicleId.value });
};

const openShareVehicleDialog = async () => {
  if (!vehicleId.value) return;
  vehicleShareModal?.open({ vehicleId: vehicleId.value });
};

const openChangelogDrawer = () => {
  changelogDrawerRef.value?.open();
};

const vehicleMenuItems: DropdownMenuItem[] = [
  {
    label: "Edit",
    icon: "mdi:pencil",
    onClick: editVehicle,
  },
  {
    label: "Share",
    icon: "mdi:share-variant",
    onClick: openShareVehicleDialog,
  },
  {
    label: "Changelog",
    icon: "mdi:history",
    onClick: openChangelogDrawer,
  },
];
</script>

<template>
  <LazyUPageCard
    v-if="vehicle"
    orientation="horizontal"
    variant="subtle"
    :ui="{
      header: 'w-full',
      container: ['lg:items-start', !vehicle.thumbnail ? 'lg:grid-cols-1' : ''],
    }"
  >
    <template #header>
      <div class="flex justify-between gap-3">
        <div class="text-base text-pretty font-semibold text-highlighted">
          {{
            [`${vehicle.make} ${vehicle.model}`, vehicle.model_year]
              .filter(Boolean)
              .join(", ")
          }}
        </div>

        <div class="flex justify-end items-center gap-1">
          <VehicleChangelogDrawer
            ref="changelogDrawerRef"
            :vehicleId="vehicle.id"
          />

          <ResponsiveMenu :items="vehicleMenuItems">
            <UButton
              label="More"
              variant="soft"
              color="neutral"
              icon="mdi:dots-vertical"
            />
          </ResponsiveMenu>
        </div>
      </div>
    </template>

    <template #description>
      <div class="flex flex-col gap-1">
        <div class="flex flex-wrap gap-1 items-center">
          <span v-show="vehicle.engine_displacement" class="text-nowrap">
            {{
              formatNumber(vehicle.engine_displacement, {
                style: "unit",
                unit: vehicle.engine_displacement_unit || "liter",
                unitDisplay: "short",
              })
            }}
          </span>
          <div
            class="size-1 bg-current rounded-full inline-block leading-none mx-1"
          ></div>
          <span class="text-nowrap">{{ vehicle.body_type }}</span>
          <div
            class="size-1 bg-current rounded-full inline-block leading-none mx-1"
          ></div>

          <span class="flex gap-1 items-center flex-nowrap text-nowrap">
            <UIcon
              :name="
                vehicle.fuel_type === 'Electric'
                  ? 'mdi:car-electric'
                  : 'mdi:car'
              "
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

        <div class="flex gap-1 items-center" v-if="currentVehicleOwner">
          <span>Owner:</span>

          <UUser
            size="xs"
            :avatar="{
              src: currentVehicleOwner?.profile_image_url,
            }"
            :name="currentVehicleOwner.name"
            :to="{
              name: 'profiles-profileId',
              params: { profileId: vehicle?.owner_user_id },
            }"
          />
        </div>

        <div
          v-show="vehicle.shares && vehicle.shares?.length > 0"
          class="flex gap-1 items-center"
        >
          <span class="">Shared with:</span>
          <UAvatarGroup size="xs" :max="2">
            <UTooltip
              v-for="share in vehicle.shares"
              :key="share.id"
              :text="profilesMap.get(share.user_id)?.name || 'Unknown'"
            >
              <UAvatar
                :src="profilesMap.get(share.user_id)?.profile_image_url"
                :alt="profilesMap.get(share.user_id)?.name"
              />
            </UTooltip>
          </UAvatarGroup>
        </div>
      </div>
    </template>

    <template #default v-if="vehicle.thumbnail">
      <picture>
        <source
          :srcset="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}?Quality=20&width=400&height=200&resize=contain`"
          media="(orientation: portrait)"
        />
        <img
          class="object-cover rounded-md w-full max-h-64"
          :src="`https://akhxphgocxpyoofvdqwi.supabase.co/storage/v1/object/public/${vehicle.thumbnail}?Quality=20&width=650&height=260&resize=contain`"
          alt="Car"
          fetchpriority="high"
          height="260"
          width="650"
        />
      </picture>
    </template>
  </LazyUPageCard>
</template>
