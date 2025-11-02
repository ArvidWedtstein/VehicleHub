<script setup lang="ts">
import { useProfile } from "~/features/profiles/useProfiles";

const router = useRouter();
const profileId = useRouteParam("profileId", "number");
const { data: profile } = await useProfile(profileId);

const sessionUser = useSupabaseUser();
const client = useSupabaseClient();

const handleUserTermination = async () => {
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
  <div>
    <NuxtLink @click="router.back()" class="link link-hover">
      <Icon name="mdi:chevron-left" />
      Back
    </NuxtLink>

    <div class="hero bg-base-200" :key="profile?.id">
      <div class="hero-content flex-col lg:flex-row">
        <img
          v-if="profile?.profile_image_url"
          :src="profile?.profile_image_url"
          class="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 class="text-5xl font-bold">{{ profile?.name }}</h1>
          <!-- <p class="py-6">Your role: {{ profile?.role_id }}</p> -->
        </div>
        <button
          v-if="sessionUser?.id === profile?.user_id"
          type="button"
          class="btn btn-sm ms-auto float-end btn-error"
          @click="handleUserTermination"
        >
          Delete all my data
        </button>
      </div>
    </div>
  </div>
</template>
