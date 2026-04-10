<script setup lang="ts">
import Modal from "~/components/Modal.vue";
import { useShareVehicleForm } from "./useShareVehicleForm";
import AutoComplete from "~/components/form/AutoComplete.vue";
import { useProfiles } from "~/features/profiles/useProfiles";
import type { Tables } from "~/types/supabase";

const open = ref(false);

const sessionUser = useSupabaseUser();
const { data: profiles } = useProfiles();

const profilesList = computed(() => {
  return profiles.value.map((p) => ({
    label: p.name || "",
    avatar: { src: p.profile_image_url || "" },
    value: p.id,
    loading: "lazy" as const,
  }));
});

const { vehicleShares, initialize, save } = useShareVehicleForm();

const handleOpen = (vehicle_id: Tables<"Vehicles">["id"]) => {
  initialize(vehicle_id);

  open.value = true;
};

const handleSubmit = async () => {
  console.log("suibmiut");
  await save();

  open.value = false;
};

const handleInviteUser = async () => {
  // TODO: implement invite user logic
  toast.success(`Invite sent`);
};

defineExpose({ open: handleOpen });
</script>

<template>
  <UModal
    v-model:open="open"
    title="Share this Vehicle"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <form id="shareVehicle" @submit.prevent="handleSubmit">
        <div class="flex items-end gap-2">
          <UFormField label="Invite others">
            <UInputMenu
              :items="profilesList"
              placeholder="Search by name or email"
            />
          </UFormField>

          <UButton label="Invite" @click="handleInviteUser" />
        </div>

        <fieldset class="fieldset my-5">
          <legend class="fieldset-legend">Who has access</legend>

          <div class="flex flex-col items-start gap-3 grow">
            <div
              v-for="(share, idx) in vehicleShares"
              :key="idx"
              class="flex items-center flex-nowrap gap-3 w-full"
            >
              <AvatarImage
                size="xs"
                :src="share.profile.profile_image_url"
                :fallbackSrc="`https://ui-avatars.com/api/?name=${share.profile.name}`"
              />

              <span class="text-sm font-medium grow">
                {{ share.profile.name }}
              </span>

              <FormInput
                type="select"
                wrapperClass="py-0"
                size="xs"
                color="primary"
                :options="[
                  { value: true, label: 'Can View' },
                  { value: false, label: 'Can Edit' },
                ]"
                v-model="share.readonly"
              />
            </div>
            <div class="flex items-center gap-3 w-full">
              <AvatarImage
                size="xs"
                :src="sessionUser?.user_metadata?.profile_image_url"
              />

              <span class="text-sm font-medium grow">
                {{ sessionUser?.user_metadata?.name }}
                (You)
              </span>

              <span class="text-sm text-primary me-4">owner</span>
            </div>
          </div>
        </fieldset>
      </form>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" @click="open = false" />
      <UButton
        type="submit"
        label="Save"
        color="primary"
        icon="mdi:content-save"
        form="shareVehicle"
      />
    </template>
  </UModal>
</template>
