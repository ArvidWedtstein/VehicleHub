import type { Tables } from "~/types/supabase";

type ChangelogItem = Tables<"changelog_with_profile">;

export function useVehicleChangelog(vehicleId: MaybeRefOrGetter<number>) {
  const id = computed(() => toValue(vehicleId));

  return useFetch<ChangelogItem[]>(
    () => `/api/vehicles/${id.value}/changelog`,
    {
      key: () => cacheKeys.changelog(id.value),
      server: false,
      lazy: true,
      default: () => [],
    },
  );
}

export const initChangelogRealtime = (
  vehicleId?: MaybeRef<number | undefined>,
) => {
  try {
    const id = computed(() => unref(vehicleId));

    const client = useSupabaseClient();
    let channel: ReturnType<typeof client.channel> | null = null;

    const cleanup = () => {
      if (!channel) return;

      client.removeChannel(channel);
      channel = null;
    };

    watch(
      id,
      (newId) => {
        cleanup();
        if (!newId) return;

        channel = client
          .channel(cacheKeys.changelog(newId))
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "Changelog",
              filter: `vehicle_id=eq.${newId}`,
            },
            async (payload) => {
              if (payload.errors) {
                console.error("Realtime changelog error:", payload.errors);
                return;
              }

              const { data: changelogData } = useNuxtData<ChangelogItem[]>(
                cacheKeys.changelog(newId),
              );
              if (!changelogData.value) return;

              const record = payload.new as Tables<"Changelog">;

              let profile: {
                name: string | null;
                profile_image_url: string | null;
              } | null = null;
              if (record.createdby_id) {
                profile = await $fetch(
                  `/api/profiles/${record.createdby_id}`,
                ).catch(() => null);
              }

              const newEntry: ChangelogItem = {
                ...record,
                createdby_name: profile?.name ?? null,
                createdby_profile_image_url: profile?.profile_image_url ?? null,
              };

              changelogData.value = [newEntry, ...changelogData.value];
            },
          )
          .subscribe();
      },
      {
        immediate: true,
      },
    );

    onUnmounted(cleanup);
  } catch (error) {
    console.log(error);
  }
};
