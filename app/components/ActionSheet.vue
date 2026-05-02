<script setup lang="ts">
import type { ArrayOrNested, DrawerProps, DropdownMenuItem } from "@nuxt/ui";

type ActionSheetItem = Omit<DropdownMenuItem, "type" | "children">;

interface ActionSheetProps extends Omit<
  DrawerProps,
  "direction" | "inset" | "open"
> {
  items?: ArrayOrNested<ActionSheetItem>;
}

const props = withDefaults(defineProps<ActionSheetProps>(), {
  items: () => [],
});

const open = ref(false);

const groups = computed<ActionSheetItem[][]>(() => {
  if (props.items.length === 0) return [];

  return Array.isArray(props.items[0])
    ? (props.items as ActionSheetItem[][])
    : [props.items as ActionSheetItem[]];
});

const close = () => {
  open.value = false;
};

const handleClick = (event: MouseEvent, item: ActionSheetItem) => {
  item.onSelect?.(event);
  close();
};

defineExpose({
  open: () => {
    open.value = true;
  },
  close,
});
</script>

<template>
  <UDrawer
    v-model:open="open"
    direction="bottom"
    inset
    :title="title"
    v-bind="$attrs"
    :ui="{
      title: 'text-center',
    }"
  >
    <slot></slot>
    <template #body>
      <div class="relative flex flex-col gap-3">
        <UFieldGroup
          v-for="group in groups"
          :key="group[0]?.label"
          orientation="vertical"
          size="xl"
        >
          <UButton
            v-for="item in group"
            :key="item.label"
            v-bind="item"
            variant="soft"
            activeColor="primary"
            :color="item.color || 'neutral'"
            block
            @click="($event) => handleClick($event, item)"
          />
        </UFieldGroup>
      </div>
    </template>

    <template #footer>
      <UButton
        label="Cancel"
        variant="soft"
        color="error"
        block
        size="lg"
        @click="close"
      />
    </template>
  </UDrawer>
</template>
