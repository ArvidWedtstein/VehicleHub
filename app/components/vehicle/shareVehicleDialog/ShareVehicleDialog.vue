<script setup lang="ts">
import { useShareVehicleForm } from "./useShareVehicleForm";
import { useProfiles } from "~/features/profiles/useProfiles";
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
  console.log("suibmiut");
  await save();

  emit("close", true);
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
    @after:enter="onOpen"
  >
    <template #body>
      <UForm
        :schema="vehicleShareSchema"
        :state="vehicleShares"
        id="shareVehicleForm"
        @submit="handleSubmit"
      >
        <div class="flex items-end gap-2">
          <UFormField label="Invite others">
            <UInputMenu
              :items="profilesList"
              placeholder="Search by name or email"
              class="grow"
            />
          </UFormField>

          <UButton type="submit" label="Invite" @click="handleInviteUser" />
        </div>

        <div class="my-5">
          <small>Who has access</small>

          <div class="flex flex-col items-start gap-3 grow">
            <div
              v-for="(share, idx) in vehicleShares"
              :key="idx"
              class="flex items-center flex-nowrap gap-3 w-full"
            >
              <UAvatar
                size="sm"
                :src="share.profile?.profile_image_url"
                :alt="share.profile?.name"
              />

              <span class="text-sm font-medium grow">
                {{ share.profile?.name }}
              </span>

              <USelect
                :items="[
                  { value: true, label: 'Can View' },
                  { value: false, label: 'Can Edit' },
                ]"
                labelKey="label"
                v-model="share.readonly"
              />
            </div>
            <div class="flex items-center gap-3 w-full">
              <UAvatar
                size="sm"
                :src="sessionUser?.user_metadata?.avatar_url"
                :alt="sessionUser?.user_metadata?.name"
              />

              <span class="text-sm font-medium grow">
                {{ sessionUser?.user_metadata?.name }}
                (You)
              </span>

              <span class="text-sm text-primary me-4">Owner</span>
            </div>
          </div>
        </div>
      </UForm>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" @click="emit('close', false)" />
    </template>
  </UModal>
</template>
