<script setup lang="ts">
type Props = {
  ignoreListClass?: boolean;
  rounded?: boolean;
  overflow?: boolean;
  divider?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  ignoreListClass: false,
  rounded: false,
  divider: false,
  overflow: true,
});

provide("listGroupSize", props.size);
</script>

<template>
  <div
    role="list"
    :class="{
      menu: !ignoreListClass,
      'menu-xs': size === 'xs',
      'menu-sm': size === 'sm',
      'menu-md': size === 'md',
      'menu-lg': size === 'lg',
      'menu-xl': size === 'xl',
      'divide-y divide-neutral divide-opacity-75 ': divider,
      '[&_li>*]:rounded-none p-0': !rounded,
      'overflow-y-auto': overflow,
    }"
    class="w-full"
  >
    <slot></slot>
  </div>
</template>
