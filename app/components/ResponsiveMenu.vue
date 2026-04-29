<script setup lang="ts">
import type { DropdownMenuProps } from "@nuxt/ui";

const { isMobile } = useBreakpoints();

interface ResponsiveMenuProps extends DropdownMenuProps {
  title?: string;
}

const props = withDefaults(defineProps<ResponsiveMenuProps>(), {
  items: () => [],
});
</script>

<template>
  <ActionSheet v-if="isMobile" :items="items" :title="title" v-bind="$attrs">
    <slot name="default">
      <UButton icon="mdi:menu" variant="outline" />
    </slot>
  </ActionSheet>

  <UDropdownMenu v-else :items="items" v-bind="$attrs">
    <slot name="default">
      <UButton icon="mdi:menu" variant="outline" />
    </slot>
  </UDropdownMenu>
</template>
