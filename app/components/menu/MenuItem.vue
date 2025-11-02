<script setup lang="ts">
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";
import type { AvatarProps } from "../AvatarImage.vue";

// TODO: add checkbox
export type MenuItemProps = {
  label?: string;
  icon?: string | Component;

  active?: boolean;
  disabled?: boolean;
  href?: string;
  to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;

  avatar?: AvatarProps;

  color?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "info"
    | "error";
};

const props = withDefaults(defineProps<MenuItemProps>(), {
  active: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (props.href || props.to) {
    return;
  }

  emit("click", event);
};

const colorClass = computed(() => {
  if (!props.color) return;

  return `text-${props.color}`;
});
</script>

<template>
  <li>
    <component
      :is="href ? 'a' : to ? 'RouterLink' : 'button'"
      v-bind="
        !href && !to
          ? { type: 'button', disabled: disabled, ...$attrs }
          : to
          ? { to: to, ...$attrs }
          : $attrs
      "
      @click="handleClick"
      :class="[
        { 'menu-disabled': disabled, 'menu-active': active },
        colorClass,
      ]"
    >
      <slot>
        <Icon v-if="icon && typeof icon === 'string'" :name="icon" />
        <component v-else-if="icon" :is="icon" />
        <AvatarImage v-else-if="avatar" v-bind="avatar" />
        {{ label }}
      </slot>
    </component>

    <slot name="children"></slot>
  </li>
</template>
