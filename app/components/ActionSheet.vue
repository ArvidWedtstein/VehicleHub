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

const drawerRef = ref<InstanceType<typeof Drawer>>();

const onSelect = (item: ActionSheetItem) => {
  item?.onClick?.();

  emit("select", item);
};

defineExpose({
  open: () => {
    drawerRef.value?.open();
  },
  close: () => {
    drawerRef.value?.close();
  },
  drawerRef,
});
</script>
<template>
  <Drawer ref="drawerRef" direction="bottom" inset>
    <template #content>
      <ListGroup size="md" divider class="my-3">
        <ListGroupItem
          v-for="(item, idx) in items"
          :key="idx"
          :title="item.label"
          size="lg"
          @click="onSelect(item)"
        />
      </ListGroup>

      <button
        class="btn btn-lg btn-soft btn-error w-full"
        @click="drawerRef?.close()"
      >
        Cancel
      </button>
    </template>
  </Drawer>
</template>
