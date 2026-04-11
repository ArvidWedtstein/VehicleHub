<script setup lang="ts">
import { useProfile } from "~/features/profiles/useProfiles";

const profileUserId = useRouteParam("profileId", "string");
const { data: profile } = await useProfile(profileUserId.value);

const sessionUser = useSupabaseUser();
const client = useSupabaseClient();

const handleUserTermination = async () => {
  if (sessionUser.value?.id !== profile.value?.user_id) return;
  if (!profile.value) return;

  const res = await useConfirm({
    title: "Delete Data?",
    message:
      "Are you sure you want to delete all your data? This cannot be undone.",
    confirmLabel: "Delete",
    severity: "danger",
  });

  if (!res) return;

  await client.rpc("terminate_user", {
    profile_user_id: profile.value.user_id,
  });

  await client.auth.signOut();
};
</script>

<template>
  <UContainer>
    <UPage class="relative">
      <UButton
        icon="i-lucide-chevron-left"
        to="/"
        size="xl"
        color="neutral"
        variant="subtle"
        class="absolute -left-14 top-4 rounded-full z-10"
      />

      <UPageHeader :title="profile?.name || ''">
        <UAvatar
          v-if="profile?.profile_image_url"
          :src="profile.profile_image_url"
          size="lg"
        />
      </UPageHeader>

      <UPageBody>
        <UButton
          v-if="sessionUser?.id === profile?.user_id"
          label="Delete all my data"
          color="error"
          @click="handleUserTermination"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
