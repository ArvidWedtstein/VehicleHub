<script setup lang="ts">
import type { NavigationMenuItem, TabsItem } from "@nuxt/ui";

const router = useRouter();
const route = useRoute();

const { isMobile } = useBreakpoints();

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

const mobileTabs = computed<NavigationMenuItem[]>(() =>
  tabs.map((tab) => {
    const routeName = (tab.value || "").toString();
    return {
      label: tab.label,
      icon: tab.icon,
      value: routeName,
      to: {
        name: routeName,
        params: { id: vehicleId.value },
      },
    };
  }),
);

const activeTab = computed({
  get() {
    return (route.name as string) || "vehicles-id-expenses";
  },
  set(tab) {
    router.push({
      name: tab.toString(),
      params: { id: vehicleId.value },
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
  <div>
    <div class="relative flex flex-col gap-3 flex-1 w-full p-4">
      <NuxtRouteAnnouncer />
      <NuxtAnnouncer />

      <VehicleCard />

      <UTabs
        v-if="!isMobile"
        v-model="activeTab"
        :items="tabs"
        :content="false"
        :unmountOnHide="false"
      />

      <slot />
    </div>

    <LazyUNavigationMenu
      v-if="isMobile"
      class="fixed bottom-0 w-full backdrop-blur-xl lg:hidden"
      :ui="{
        root: 'border-t border-default py-2 w-full [&>div]:w-full',
        list: 'justify-evenly justify-items-stretch w-full',
        item: 'py-0 min-w-16',
        link: 'flex-col gap-1 px-3',
        linkLeadingIcon: 'size-5',
        linkLabel: 'text-[10px]/3 font-normal',
      }"
      :items="mobileTabs"
      orientation="horizontal"
    />
  </div>
</template>
