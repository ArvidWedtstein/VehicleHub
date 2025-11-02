<script setup lang="ts">
import { useVehicle } from "~/features/vehicles/useVehicles";
import VehicleCard from "~/features/vehicles/VehicleCard.vue";

const router = useRouter();

const { data: vehicle } = await useVehicle(useRouteParam("id", "number").value);

const tabs = [
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
        name?.toString().startsWith(value)
      )
    );

    const tab = currentTab?.value || tabs[0]?.value;

    return tab;
  },
  set(tab) {
    navigateTo({
      name: tab,
    });
  },
});

onMounted(() => {
  const currentRoute = router.currentRoute.value;

  const matchedTab = currentRoute.name
    ?.toString()
    .startsWith(activeTab.value || "");

  if (!matchedTab) {
    navigateTo({
      name: activeTab.value,
    });
  }
});
</script>

<template>
  <NuxtLayout name="default">
    <div>
      <div class="relative flex flex-col gap-3 flex-1 w-full p-4">
        <VehicleCard v-if="vehicle" :vehicle="vehicle" />

        <Tabs
          class="hidden md:flex"
          v-model="activeTab"
          variant="boxed"
          :items="tabs"
          :content="false"
        ></Tabs>
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>
