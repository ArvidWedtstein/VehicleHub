<script setup lang="ts">
import Modal from "~/components/Modal.vue";
import { useShareVehicleForm } from "./useShareVehicleForm";
import AutoComplete from "~/components/form/AutoComplete.vue";
import { useProfiles } from "~/features/profiles/useProfiles";
import type { Tables } from "~/types/supabase";

const modalRef = ref<InstanceType<typeof Modal>>();

const sessionUser = useSupabaseUser();
const { data: profiles } = useProfiles();

const { vehicleShares, initialize, save } = useShareVehicleForm();

const handleOpen = (vehicle_id: Tables<"Vehicles">["id"]) => {
  initialize(vehicle_id);

  modalRef.value?.modalRef?.showModal();
};

const handleSubmit = async () => {
  console.log("suibmiut");
  await save();

  modalRef.value?.close();
};

const handleInviteUser = async () => {
  // TODO: implement invite user logic
  toast.success(`Invite sent`);
};

defineExpose({ modalRef: modalRef, open: handleOpen });
</script>

<template>
  <Modal ref="modalRef" title="Share this Vehicle" size="sm">
    <form id="shareVehicle" @submit.prevent="handleSubmit">
      <div class="flex items-end gap-2">
        <AutoComplete
          :options="profiles"
          :getOptionLabel="(item) => item.name || ''"
          :getOptionValue="(item) => item.id || ''"
          label="Invite others"
          placeholder="Search by name or email"
        >
          <template #option="{ option, selected }">
            <div
              class="flex items-center gap-2"
              :class="{ 'bg-primary/10': selected }"
            >
              <AvatarImage
                size="xxs"
                :src="option.profile_image_url"
                :fallbackSrc="`https://ui-avatars.com/api/?name=${option.name}`"
              />

              <span class="text-sm font-medium grow">{{ option.name }}</span>
            </div>
          </template>
        </AutoComplete>

        <button type="button" class="btn btn-primary" @click="handleInviteUser">
          Invite
        </button>
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

    <template #actions>
      <button type="reset" class="btn btn-neutral" @click="modalRef?.close()">
        Cancel
      </button>
      <button type="submit" form="shareVehicle" class="btn btn-primary">
        <Icon name="mdi:content-save" />
        Save
      </button>
    </template>
  </Modal>
</template>
