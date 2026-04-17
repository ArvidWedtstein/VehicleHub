<script setup lang="ts">
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";
import type { AvatarProps } from "@nuxt/ui";

type ActionSheetItem = {
  label?: string;

  active?: boolean;
  disabled?: boolean;

  href?: string;
  to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;

  avatar?: AvatarProps;

  onClick?: () => void;

  [key: string]: any;
};

type Props = {
  items?: Array<ActionSheetItem>;
};

type Emits = {
  select: [item: ActionSheetItem];
};

withDefaults(defineProps<Props>(), {
  items: () => [],
});

const emit = defineEmits<Emits>();

const open = ref(false);

const onSelect = (item: ActionSheetItem) => {
  item?.onClick?.();

  emit("select", item);
};

defineExpose({
  open: () => {
    open.value = true;
  },
  close: () => {
    open.value = false;
  },
});
</script>
<template>
  <UDrawer v-model:open="open" direction="bottom" inset>
    <slot></slot>
    <template #body>
      <UPageList divide class="gap-1">
        <UButton
          v-for="(item, idx) in items"
          :key="idx"
          :label="item.label"
          variant="soft"
          color="neutral"
          block
          size="xl"
          @click="onSelect(item)"
        />
      </UPageList>
    </template>
    <template #footer>
      <UButton
        label="Cancel"
        variant="soft"
        color="error"
        block
        size="lg"
        @click="open = false"
      />
    </template>
  </UDrawer>
</template>
