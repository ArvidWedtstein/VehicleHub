<script setup lang="ts">
import { onMounted, type Component } from "vue";
import type { AvatarProps } from "./AvatarImage.vue";

type TabItem = {
  label?: string;
  icon?: string | Component;
  avatar?: AvatarProps;
  value?: string | number;

  slot?: string;

  disabled?: boolean;
};

type Props = {
  items?: TabItem[];
  variant?: "default" | "boxed" | "lifted" | "bordered";
  containerClass?: string;

  /** Enables for tab content */
  content?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  tabs: () => [],
  variant: "default",

  content: true,
});

const emit = defineEmits<{
  onTabChange: [item: TabItem];
}>();

const activeTabModel = defineModel<TabItem["value"]>({
  required: false,
  default: undefined,
});

const handleTabChange = (item: TabItem) => {
  if (activeTabModel.value === item.value) return;

  activeTabModel.value = item.value;
  emit("onTabChange", item);
};

onMounted(() => {
  if (!props.items || activeTabModel.value != null) return;

  activeTabModel.value = props.items[0]?.value;
});
</script>

<template>
  <div class="flex flex-col gap-3 w-full flex-1">
    <div
      class="tabs w-full"
      :class="{
        'tabs-box': variant === 'boxed',
        'tabs-lift': variant === 'lifted',
        'tabs-border': variant === 'bordered',
      }"
    >
      <button
        v-for="(tab, tabIndex) in items"
        :key="tabIndex"
        type="button"
        role="tab"
        class="tab"
        :class="{
          'tab-active': tab.value === activeTabModel,
        }"
        @click="handleTabChange(tab)"
      >
        <Icon
          v-if="tab.icon && typeof tab.icon == 'string'"
          :name="tab.icon"
          class="me-2"
        />
        <component v-else-if="tab.icon" :is="tab.icon" class="me-2" />

        {{ tab.label }}
      </button>
    </div>

    <template v-if="content">
      <div
        v-for="(tab, tabIndex) in items"
        :key="`tab-panel-${tabIndex}`"
        :id="`tab-${tabIndex}`"
        class="tab-content"
        :class="[
          {
            block: tab.value === activeTabModel,
          },
          containerClass,
        ]"
      >
        <slot :name="tab.slot || 'content'"></slot>
      </div>
    </template>
  </div>
</template>
