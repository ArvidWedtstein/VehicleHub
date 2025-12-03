<script setup lang="ts">
import type { Tables } from "~/types/supabase";

type Props = {
  service: Tables<"vehicleservicelogs_with_items">;
};

const { service } = defineProps<Props>();

const icon = computed(() => {
  const serviceType = service.type?.toLowerCase() || "";

  switch (serviceType) {
    case "wheel":
      return "mdi:tire";
    case "oil":
      return "mdi:oil";
    default:
      return "mdi:wrench";
  }
});
</script>

<template>
  <ListGroupItem
    :title="service.type || 'Service'"
    as="a"
    :href="`services/${service.id}`"
  >
    <template #icon="{ sizeClass }">
      <Icon :name="icon" class="md:p-2" :class="sizeClass" />
    </template>

    <template #subtitle>
      <dl class="flex items-center flex-nowrap gap-1">
        <template v-if="service.date">
          <dt>
            <Icon name="mdi:calendar" />
          </dt>
          <dd>
            <NuxtTime
              :datetime="service.date"
              :format="{
                dateStyle: 'medium',
              }"
            />
          </dd>
        </template>

        <template v-if="service.provider">
          <dt class="border-l border-neutral ml-2 pl-2">
            <Icon name="mdi:account-question" class="leading-none" />
          </dt>
          <dd class="text-nowrap truncate">
            {{ service.provider }}
          </dd>
        </template>
      </dl>
    </template>

    <template #endIcon>
      <span class="font-bold">
        {{
          formatNumber(service.total_cost ?? 0, {
            style: "currency",
            currency: service.currency || "EUR",
            currencyDisplay: "narrowSymbol",
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          })
        }}
      </span>

      <Icon name="mdi:chevron-right" />
    </template>
  </ListGroupItem>
</template>
