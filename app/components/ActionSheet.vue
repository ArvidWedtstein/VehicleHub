<script setup lang="ts" generic="T extends string | number = string">
import type Drawer from "./Drawer.vue";

type Option<T extends string | number> = {
  label?: string;
  value: T;
};
type Props<T extends string | number> = {
  options?: Array<Option<T>>;
};

type Emits<T extends string | number> = {
  select: [option: Option<T>];
};

withDefaults(defineProps<Props<T>>(), {
  options: () => [],
});

const emit = defineEmits<Emits<T>>();

const drawerRef = ref<InstanceType<typeof Drawer>>();

defineExpose({
  open: () => {
    drawerRef.value?.open();
  },
  close: () => {
    drawerRef.value?.close();
  },
});
</script>
<template>
  <Drawer ref="drawerRef" direction="bottom" inset>
    <template #content>
      <ListGroup size="md" divider class="my-3">
        <ListGroupItem
          v-for="option in options"
          :key="option.value"
          :title="option.label"
          size="lg"
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
