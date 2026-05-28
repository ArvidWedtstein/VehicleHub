<script
  setup
  lang="ts"
  generic="Table extends keyof Database['public']['Tables']"
>
import type { FilterSchema } from "~/composables/filterBuilder/filterSchema";
import type { Database } from "~/types/supabase";

defineProps<{
  schema: FilterSchema<Table>;
  filterState: Record<string, any>;
}>();
</script>

<template>
  <div class="flex flex-col divide-y-2 divide-neutral">
    <UAccordion
      type="multiple"
      :items="schema"
      valueKey="column"
      :defaultValue="schema.map((item) => item.column.toString())"
    >
      <template #body="{ item }">
        <div class="p-4">
          <UCheckboxGroup
            v-if="['select', 'multi-select'].includes(item.type)"
            :items="item.options"
            v-model="filterState[item.column as string]"
            size="lg"
          />

          <UInput
            v-else-if="['text', 'search', 'date', 'number'].includes(item.type)"
            :type="item.type"
            v-model="filterState[item.column as string]"
            class="w-100"
          />

          <div
            v-else-if="item.type === 'date-range'"
            class="flex items-baseline-last gap-2"
          >
            <UFormField
              label="From"
              :for="`${item.column.toString()}-from`"
              class="grow"
            >
              <UInputDate
                v-model.lazy="filterState[item.column as string][0]"
                :maxValue="filterState[item.column as string][1]"
                class="w-full"
              >
                <template #trailing>
                  <UPopover>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="mdi:calendar"
                      aria-label="Select a date"
                      class="px-0"
                    />

                    <template #content>
                      <UCalendar
                        v-model="filterState[item.column as string][0]"
                        class="p-2"
                      />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>

            <UIcon name="mdi:minus" class="self-center" />

            <UFormField
              label="To"
              :for="`${item.column.toString()}-to`"
              class="grow"
            >
              <UInputDate
                v-model.lazy="filterState[item.column as string][1]"
                :minValue="filterState[item.column as string][0]"
                class="w-full"
              >
                <template #trailing>
                  <UPopover>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      icon="mdi:calendar"
                      aria-label="Select a date"
                      class="px-0"
                    />

                    <template #content>
                      <UCalendar
                        v-model="filterState[item.column as string][1]"
                        class="p-2"
                      />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>
          </div>

          <div
            v-else-if="
              item.type === 'range' &&
              item.inputType === 'input' &&
              Array.isArray(filterState[item.column as string])
            "
            class="flex gap-2 w-full"
          >
            {{ filterState[item.column as string][0] }}
            <UInput
              v-model="filterState[item.column as string][0]"
              type="number"
              :min="item.range?.min"
              :max="item.range?.max"
              :step="item.range?.step"
              placeholder="Min"
              class="grow"
            />
            <UIcon name="mdi:minus" class="self-center" />
            <UInput
              v-model="filterState[item.column as string][1]"
              type="number"
              :min="item.range?.min"
              :max="item.range?.max"
              :step="item.range?.step"
              placeholder="Max"
              class="grow"
            />
          </div>

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
