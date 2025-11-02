import type { Tables, TablesUpdate } from "~/types/supabase";

export function useProfiles() {
  return useAsyncData(
    "profiles",
    async () => {
      return await $fetch<Tables<"Profiles">[]>("/api/profiles", {
        headers: useRequestHeaders(["cookie"]),
      });
    },
    {
      default: () => [],
    }
  );
}
export const useProfile = (id?: MaybeRef<string | number | undefined>) => {
  return useAsyncData(`profiles-${unref(id)}`, async () => {
    return await $fetch<Tables<"Profiles">>(`/api/profiles/${unref(id)}`, {
      headers: useRequestHeaders(["cookie"]),
    });
  });
};

export async function updateProfile(
  id: string,
  patch: Partial<TablesUpdate<"Profiles">>
) {
  await $fetch(`/api/profiles/${id}`, {
    method: "put",
    body: patch,
    headers: useRequestHeaders(["cookie"]),
  });
  refreshNuxtData("profiles");
}
