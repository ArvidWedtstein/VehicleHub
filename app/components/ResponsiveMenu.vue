<script setup lang="ts">
import type { MenuItem, MenuProps } from "./menu/Menu.vue";

const { isMobile } = useBreakpoints();

export interface ResponsiveMenuProps extends Pick<MenuProps, "alignMenu"> {
  items?: Omit<MenuItem, "children" | "type" | "color">[];
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
  <ClientOnly>
    <template v-if="isMobile">
      <slot name="default" :toggle="openActionSheet">
        <button
          type="button"
          class="btn btn-outline"
          @click.stop="openActionSheet()"
        >
          <Icon name="mdi:menu" />
        </button>
      </slot>

      <ActionSheet ref="actionSheetRef" :items="items" />
    </template>

    <template v-else>
      <Menu :items="items" :alignMenu="alignMenu" v-bind="$attrs">
        <template #default="{ toggle }">
          <slot name="default" :toggle="toggle">
            <button type="button" class="btn btn-outline" @click.stop="toggle">
              <Icon name="mdi:menu" />
            </button>
          </slot>
        </template>
      </Menu>
    </template>
  </ClientOnly>
</template>
