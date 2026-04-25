<script
  setup
  lang="ts"
  generic="Table extends keyof Database['public']['Tables']"
>
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";
import type { Database, Tables } from "~/types/supabase";

defineProps<{
  schema: FilterSchema<Table>;
  filterState: Record<string, any>;
}>();
</script>

<template>
  <div class="flex flex-col divide-y-2 divide-neutral">
    <UAccordion type="multiple" :items="schema">
      <template #body="{ item }">
        <div class="p-4">
          <UCheckboxGroup
            v-if="['select', 'multi-select'].includes(item.type)"
            :items="item.options"
            v-model="filterState[item.column as string]"
          />

          <UInput
            v-else-if="['text', 'search', 'date', 'number'].includes(item.type)"
            :type="item.type"
            v-model="filterState[item.column as string]"
            class="w-100"
          />

          <UInputDate
            v-else-if="item.type === 'date-range'"
            range
            v-model.lazy="filterState[item.column as string]"
            :minValue="filterState[item.column as string][0]"
            :maxValue="filterState[item.column as string][1]"
          />

          <USlider
            v-else-if="
              item.type === 'range' &&
              Array.isArray(filterState[item.column as string])
            "
            v-model="filterState[item.column as string]"
            v-bind="item.range"
            tooltip
          />

          <UCheckbox
            v-else-if="item.type === 'boolean'"
            v-model.lazy="filterState[item.column as string]"
          />
        </div>
      </template>
    </UAccordion>

    <slot name="actions" />
  </div>
</template>
