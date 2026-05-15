<script setup lang="ts">
import type { Tables } from "~/types/supabase";

useHead({
  titleTemplate: "%s | Vehicle Hub",
});

definePageMeta({
  auth: false,
});

useSeoMeta({
  title: "Vehicles",
  ogTitle: "Vehicles",
  description: "List of vehicles owned or shared with you.",
  ogDescription: "List of vehicles owned or shared with you.",
  ogImage: "/img/StartImg.jpg",
});

const filters = ref<FilterOption<Tables<"Vehicles">>[]>([]);
const search = shallowRef("");

const { pending, status } = useVehicles(filters);

const handleSearch = () => {
  if (!search.value) {
    filters.value = [];
    return;
  }

  const searchFilter: FilterOption<Tables<"Vehicles">> = {
    column: "search_column",
    operator: "fts",
    value: search.value,
  };

  filters.value = [searchFilter];
};
</script>

<template>
  <UContainer>
    <UPageHeader
      title="Your Vehicles"
      description="Vehicles owned or shared with you"
    >
      <template #links>
        <UInput
          type="search"
          icon="mdi:search"
          size="md"
          variant="outline"
          placeholder="Search..."
          :loading="status === 'pending'"
          v-model.lazy="search"
          @change="handleSearch"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <VehicleList />
    </UPageBody>
  </UContainer>
</template>
