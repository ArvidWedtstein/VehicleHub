import { useProfile } from "~/features/profiles/useProfiles";
import type { Tables } from "~/types/supabase";

export function useVehicleChangelog(
  vehicleId?: MaybeRef<string | number | undefined>,
) {
  return useFetch<Tables<"changelog_with_profile">[]>(
    `/api/vehicles/${unref(vehicleId)}/changelog`,
    {
      key: `vehicles-${unref(vehicleId)}_changelog`,
      immediate: !!unref(vehicleId),
      default: () => [],
    },
  );
}

export const initChangelogRealtime = (
  vehicleId?: MaybeRef<string | number | undefined>,
) => {
  try {
    const client = useSupabaseClient();
    client
      .channel("Changelog")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Changelog",
          filter: `vehicle_id=eq.${unref(vehicleId)}`,
        },
        async (payload) => {
          if (payload.errors) throw payload.errors;

          // Get missing fields from profiles, since realtime does not work views

          useAsyncData(`vehicles-${unref(vehicleId)}_changelog`, async () => {
            const { data: profile } = await useProfile(
              payload.new["createdby_id"],
            );

            const newEntryWithProfile: Tables<"changelog_with_profile"> = {
              ...(payload.new as Tables<"Changelog">),
              createdby_name: profile.value?.name || null,
              createdby_profile_image_url:
                profile.value?.profile_image_url || null,
            };
            return [newEntryWithProfile];
          });
        },
      )
      .subscribe();
  } catch (error) {
    console.log(error);
  }
};
