<script setup lang="ts">
import type { DropdownMenuProps } from "@nuxt/ui";

const { isMobile } = useBreakpoints();

export interface ResponsiveMenuProps extends DropdownMenuProps {
  items?: DropdownMenuProps["items"];
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
