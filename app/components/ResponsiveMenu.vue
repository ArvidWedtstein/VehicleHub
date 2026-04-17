<script setup lang="ts">
import type { DropdownMenuItem, DropdownMenuProps } from "@nuxt/ui";

const { isMobile } = useBreakpoints();

export interface ResponsiveMenuProps extends DropdownMenuProps {
  items?: Omit<DropdownMenuItem, "children" | "type" | "color">[];
}

withDefaults(defineProps<ResponsiveMenuProps>(), {
  items: () => [],
});
</script>

<template>
  <template v-if="isMobile">
    <ActionSheet ref="actionSheetRef" :items="items" v-bind="$attrs">
      <slot name="default">
        <UButton icon="mdi:menu" variant="outline" />
      </slot>
    </ActionSheet>
  </template>

  <template v-else>
    <UDropdownMenu :items="items" v-bind="$attrs">
      <slot name="default">
        <UButton icon="mdi:menu" variant="outline" />
      </slot>
    </UDropdownMenu>
  </template>
</template>
