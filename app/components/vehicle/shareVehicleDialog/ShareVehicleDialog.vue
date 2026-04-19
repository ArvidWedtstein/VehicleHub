<script setup lang="ts">
import { useShareVehicleForm } from "./useShareVehicleForm";
import type { Tables } from "~/types/supabase";

const { vehicleId } = defineProps<{
  vehicleId: Tables<"Vehicles">["id"];
}>();

const emit = defineEmits<{
  close: [boolean];
}>();

const sessionUser = useSupabaseUser();
const { data: profiles } = useProfiles();

const toast = useToast();

const profilesList = computed(() => {
  return profiles.value
    .filter((p) => p.user_id !== sessionUser.value?.id)
    .map((p) => ({
      label: p.name || "",
      avatar: { src: p.profile_image_url || "" },
      value: p.id,
      loading: "lazy" as const,
    }));
});

const { vehicleShareSchema, vehicleShares, initialize, save } =
  useShareVehicleForm();

const onOpen = () => {
  initialize(vehicleId);
};

const handleSubmit = async () => {
  await save();

  emit("close", true);
};

const removeUser = async (userId: string) => {
  vehicleShares.value = vehicleShares.value.filter(
    ({ user_id }) => user_id !== userId,
  );
};

const handleInviteUser = async () => {
  // TODO: implement invite user logic
  toast.add({ title: `Invite sent` });
};
</script>

<template>
  <UModal
    title="Share this Vehicle"
    :ui="{ footer: 'justify-end' }"
    :close="{ onClick: () => emit('close', false) }"
    @after:enter="onOpen"
  >
    <template #body>
      <UForm
        :schema="vehicleShareSchema"
        :state="vehicleShares"
        id="shareVehicleForm"
        @submit.prevent="handleSubmit"
      >
        <div class="flex items-end gap-2">
          <UFormField label="Invite others">
            <UInputMenu
              :items="profilesList"
              placeholder="Search by name or email"
              class="grow"
            />
          </UFormField>

          <UButton type="button" label="Invite" @click="handleInviteUser" />
        </div>

        <div class="my-5">
          <small>Who has access</small>

          <div class="flex flex-col items-start gap-3 grow">
            <UEmpty
              v-if="!vehicleShares.length"
              title="Only you have access"
              variant="soft"
            />
            <div
              v-for="(share, idx) in vehicleShares"
              :key="idx"
              class="flex items-center flex-nowrap gap-3 w-full"
            >
              <UUser
                :avatar="{
                  src: share.profile?.profile_image_url,
                  alt: share.profile?.name,
                  loading: 'lazy',
                }"
                :name="share.profile?.name"
              />

              <div class="grow"></div>

              <USelect
                :items="[
                  { value: true, label: 'Can View' },
                  { value: false, label: 'Can Edit' },
                ]"
                labelKey="label"
                v-model="share.readonly"
              />

              <UButton icon="mdi:close" @click="removeUser(share.user_id)" />
            </div>
          </div>
        </div>
      </UForm>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" @click="emit('close', false)" />

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
