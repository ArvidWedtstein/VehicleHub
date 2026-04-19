import type { Tables } from "~/types/supabase";

export function useVehicleChangelog(
  vehicleId?: MaybeRef<string | number | undefined>,
) {
  const id = computed(() => unref(vehicleId));

  const key = computed(() =>
    id.value ? `vehicle-${id.value}_changelog` : undefined,
  );

  return useFetch<Tables<"changelog_with_profile">[]>(
    `/api/vehicles/${id.value}/changelog`,
    {
      key: key.value,
      watch: [id],
      default: () => [],
    },
  );
}

export const initChangelogRealtime = (
  vehicleId?: MaybeRef<string | number | undefined>,
) => {
  try {
    const id = computed(() => unref(vehicleId));
    const key = computed(() => `vehicle-${id.value}_changelog`);

    const client = useSupabaseClient();
    let channel: ReturnType<typeof client.channel> | null = null;

    watch(
      id,
      (vehicleId) => {
        if (!vehicleId) return;

        if (channel) {
          client.removeChannel(channel);
        }

        channel = client
          .channel("Changelog")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "Changelog",
              filter: `vehicle_id=eq.${id.value}`,
            },
            async (payload) => {
              if (payload.errors) throw payload.errors;

              // Get missing fields from profiles, since realtime does not work views
              const nuxtData = useNuxtData<Tables<"changelog_with_profile">[]>(
                key.value,
              );
              if (!nuxtData.data.value) return;

              const { data: profile } = await useProfile(
                payload.new["createdby_id"],
              );

              const newEntry: Tables<"changelog_with_profile"> = {
                ...(payload.new as Tables<"Changelog">),
                createdby_name: profile.value?.name || null,
                createdby_profile_image_url:
                  profile.value?.profile_image_url || null,
              };

              nuxtData.data.value.unshift(newEntry);
            },
          )
          .subscribe();
      },
      {
        immediate: true,
      },
    );

    onUnmounted(() => {
      if (channel) client.removeChannel(channel);
    });
  } catch (error) {
    console.log(error);
  }
};
