<script setup lang="ts">
import type { DropdownMenuItem, DropdownMenuProps } from "@nuxt/ui";

type ActionSheetItem = Omit<
  DropdownMenuItem,
  "children" | "type" | "color" | "block" | "size" | "variant"
>;
type Props = {
  items?: ActionSheetItem[] | ActionSheetItem[][];
};

withDefaults(defineProps<Props>(), {
  items: () => [],
});

const open = ref(false);

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
        <template v-for="(item, idx) in items" :key="idx">
          <UFieldGroup v-if="Array.isArray(item)" orientation="vertical">
            <UButton
              v-for="(subItem, subIdx) in item"
              :key="subIdx"
              v-bind="subItem"
              variant="soft"
              color="neutral"
              block
              size="xl"
              :disabled="subItem.disabled"
            />
          </UFieldGroup>

          <UButton
            v-else
            v-bind="item"
            variant="soft"
            color="neutral"
            block
            size="xl"
            :disabled="item.disabled"
          />
        </template>
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
