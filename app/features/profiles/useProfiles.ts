import type { Tables, TablesUpdate } from "~/types/supabase";

export function useProfiles() {
  return useFetch<Tables<"Profiles">[]>("/api/profiles", {
    key: "profiles",
    default: () => [],
  });
}

export const useProfile = (
  id?: MaybeRef<string | number | undefined | null>,
) => {
  const profileId = computed(() => unref(id));

  return useFetch<Tables<"Profiles">>(`/api/profiles/${profileId.value}`, {
    key: () => `profile-${profileId.value}`,
    immediate: !!profileId.value,
    watch: [profileId],
  });
};

export async function updateProfile(
  id: string,
  patch: Partial<TablesUpdate<"Profiles">>,
) {
  await $fetch(`/api/profiles/${id}`, {
    method: "put",
    body: patch,
    headers: useRequestHeaders(["cookie"]),
  });
  refreshNuxtData("profiles");
}
