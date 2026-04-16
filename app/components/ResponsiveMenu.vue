<script setup lang="ts">
import type { DropdownMenuItem, DropdownMenuProps } from "@nuxt/ui";

const { isMobile } = useBreakpoints();

export interface ResponsiveMenuProps extends DropdownMenuProps {
  items?: Omit<DropdownMenuItem, "children" | "type" | "color">[];
}

withDefaults(defineProps<ResponsiveMenuProps>(), {
  items: () => [],
});

const actionSheetRef = ref<ComponentPublicInstance<{ open: () => void }>>();

const openActionSheet = () => {
  actionSheetRef.value?.open();
};
</script>

<template>
  <template v-if="isMobile">
    <slot name="default" :toggle="openActionSheet">
      <UButton icon="mdi:menu" variant="outline" @click="openActionSheet" />
    </slot>

    <ActionSheet ref="actionSheetRef" :items="items" />
  </template>

  <template v-else>
    <UDropdownMenu :items="items" v-bind="$attrs">
      <slot name="default">
        <UButton icon="mdi:menu" variant="outline" />
      </slot>
    </UDropdownMenu>
  </template>
</template>
