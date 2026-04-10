<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { useVehicle } from "~/features/vehicles/useVehicles";
import VehicleCard from "~/features/vehicles/VehicleCard.vue";

const router = useRouter();

const vehicleId = useRouteParam("id", "number");

const { setLastVehicle } = useLastVehicle();

watchEffect(() => {
  if (vehicleId.value) {
    setLastVehicle(vehicleId.value);
  }
});

const tabs: TabsItem[] = [
  {
    label: "Expenses",
    value: "vehicles-id-expenses",
    icon: "mdi:gas-station",
  },
  {
    label: "Services",
    value: "vehicles-id-services",
    icon: "mdi:wrench",
  },
  {
    label: "Files",
    value: "vehicles-id-files",
    icon: "mdi:folder",
  },
  {
    label: "Stats",
    value: "vehicles-id-stats",
    icon: "mdi:chart-bar",
  },
];

const activeTab = computed({
  get() {
    const currentRoute = router.currentRoute.value;

    const currentTab = tabs.find(({ value }) =>
      currentRoute.matched.some(({ name }) =>
        name?.toString().startsWith(value?.toString() || ""),
      ),
    );

    const tab = currentTab?.value || tabs[0]?.value;

    return tab;
  },
  set(tab) {
    if (!tab) return;
    navigateTo({
      name: tab.toString(),
    });
  },
});

onMounted(() => {
  const currentRoute = router.currentRoute.value;

  const matchedTab = currentRoute.name
    ?.toString()
    .startsWith(activeTab.value?.toString() || "");

  if (!matchedTab) {
    navigateTo({
      name: activeTab.value?.toString() || "",
    });
  }
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtAnnouncer />

  <div>
    <div class="relative flex flex-col gap-3 flex-1 w-full p-4">
      <VehicleCard />

      <UTabs
        v-model="activeTab"
        :items="tabs"
        :content="false"
        :unmountOnHide="false"
      />

      <slot />
    </div>
  </div>
</template>
