<script setup lang="ts">
import type { ArrayOrNested, DrawerProps, DropdownMenuItem } from "@nuxt/ui";

type ActionSheetItem = Omit<DropdownMenuItem, "type">;

interface ActionSheetProps extends Omit<
  DrawerProps,
  "direction" | "inset" | "open"
> {
  items?: ArrayOrNested<ActionSheetItem>;
}

const props = withDefaults(defineProps<ActionSheetProps>(), {
  items: () => [],
});

const emit = defineEmits<{ select: [] }>();

const open = ref(false);

const groups = computed<ActionSheetItem[][]>(() => {
  if (props.items.length === 0) return [];
  return Array.isArray(props.items[0])
    ? (props.items as ActionSheetItem[][])
    : [props.items as ActionSheetItem[]];
});

const open_ = () => {
  open.value = true;
};

const close = () => {
  open.value = false;
};

const handleClick = (event: MouseEvent, item: ActionSheetItem) => {
  if (item.children?.length) {
    return;
  }
  item.onSelect?.(event);
  emit("select");
  close();
};

defineExpose({
  open: open_,
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
          <template v-for="item in group" :key="item.label">
            <template v-if="item.children?.length">
              <LazyActionSheet
                nested
                :title="item.label"
                :items="item.children"
                @select="close"
              >
                <UButton
                  v-bind="{ ...omit(item, ['children']) }"
                  variant="soft"
                  :color="item.color || 'neutral'"
                  trailingIcon="mdi:chevron-right"
                  block
                  @click="($event) => handleClick($event, item)"
                  :ui="{
                    trailingIcon: 'ms-0',
                  }"
                />
              </LazyActionSheet>
            </template>

            <UButton
              v-else
              v-bind="{ ...omit(item, ['children']) }"
              variant="soft"
              :color="item.color || 'neutral'"
              block
              @click="($event) => handleClick($event, item)"
            />
          </template>
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
