<script setup lang="ts">
import { formatNumber } from "@/utils/format";
import type { Tables } from "~/types/supabase";

type Props = {
  expense: Tables<"VehicleExpenses">;
};

defineProps<Props>();
</script>

<template>
  <ListGroupItem :title="expense.type" as="a" :href="`expenses/${expense.id}`">
    <template #icon="{ sizeClass }">
      <Icon name="mdi:gas-station" class="p-2" :class="sizeClass" />
    </template>

    <template #subtitle>
      <dl class="flex items-center flex-nowrap divide-x-1 divide-neutral">
        <div class="flex items-center gap-1 not-first:ps-2 not-last:pe-2">
          <Icon name="mdi:calendar" />
          <NuxtTime
            :datetime="expense.date"
            :format="{
              dateStyle: 'medium',
            }"
          />
        </div>

        <div class="flex items-center gap-1 not-first:ps-2 not-last:pe-2">
          {{
            formatNumber(expense.amount || 0, {
              style: "unit",
              unitDisplay: "long",
              unit: expense.unit || "liter",
            })
          }}
        </div>
      </dl>
    </template>

    <template #endIcon>
      <span class="font-bold">
        {{
          formatNumber(expense.cost ?? 0, {
            style: "currency",
            currency: expense.currency || "EUR",
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          })
        }}
      </span>

      <Icon name="mdi:chevron-right" size="1.2em" />
    </template>
  </ListGroupItem>
</template>
