<script setup lang="ts">
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";
import type { AvatarProps } from "./AvatarImage.vue";
import type Drawer from "./Drawer.vue";

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
    <template #body>
      <ListGroup size="md" divider class="my-3">
        <ListGroupItem
          v-for="(item, idx) in items"
          :key="idx"
          :title="item.label"
          size="lg"
          @click="onSelect(item)"
        />
      </ListGroup>
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
