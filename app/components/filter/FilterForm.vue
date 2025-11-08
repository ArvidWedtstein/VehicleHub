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
    <div
      v-for="field in schema"
      :key="field.column"
      class="collapse collapse-arrow join-item rounded-none"
    >
      <input
        type="checkbox"
        :name="`filter-${String(field.column)}-collapse`"
      />
      <div class="collapse-title font-semibold">
        {{ field.label }}
      </div>
      <div class="collapse-content">
        <div
          v-if="['select', 'multi-select'].includes(field.type)"
          class="flex flex-col gap-1"
        >
          <label class="label">
            <input
              type="checkbox"
              :name="`filter-${String(field.column)}-all`"
              class="checkbox"
              :value="null"
              :checked="field.options?.every(opt => filterState[field.column as string]?.includes(opt.value))"
              @change="($event) => {
                if (($event.target as HTMLInputElement).checked) {
                  filterState[field.column as string] = field.options?.map(p => p.value) || [];
                  return;
                }
                filterState[field.column as string] = [];
              }"
            />
            All
          </label>

          <label v-for="opt in field.options" :key="opt.value" class="label">
            <input
              type="checkbox"
              :name="`filter-${String(field.column)}-${opt.value}`"
              :id="`filter-${String(field.column)}-${opt.value}`"
              :value="opt.value"
              class="checkbox"
              v-model="filterState[field.column as string]"
            />
            {{ opt.label }}
          </label>
        </div>

        <div
          v-else-if="field.type === 'range' && Array.isArray(filterState[field.column as string])"
          class="flex gap-2"
        >
          <FormSlider
            v-model="filterState[field.column as string]"
            v-bind="field.range"
          />
          {{ filterState[field.column as string] }}
        </div>

        <FormInput
          v-else-if="['text', 'search', 'date', 'number'].includes(field.type)"
          :type="field.type"
          v-model="filterState[field.column as string]"
        />

        <template v-else-if="field.type === 'date-range'">
          <FormInput
            type="date"
            v-model="filterState[field.column as string][0]"
            :max="filterState[field.column as string][1]"
          />
          <FormInput
            type="date"
            v-model="filterState[field.column as string][1]"
            :min="filterState[field.column as string][0]"
          />
        </template>

        <label
          v-else-if="field.type === 'boolean'"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            v-model="filterState[field.column as string]"
          />
          {{ field.label }}
        </label>
      </div>
    </div>

    <slot name="actions" />
  </div>
</template>
