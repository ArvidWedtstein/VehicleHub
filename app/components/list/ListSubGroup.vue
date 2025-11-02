<script setup lang="ts">
import ListGroup from "./ListGroup.vue";

type Props = {
  title: string;
  sticky?: boolean;
  bg?:
    | "base"
    | "neutral"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
};

withDefaults(defineProps<Props>(), {
  title: "",
  sticky: false,
  bg: "base",
});
</script>

<template>
  <div class="relative not-first:mt-4">
    <div
      class="z-10 border-y border-b-neutral border-t-base-100 px-3 py-1.5 text-sm leading-6 font-semibold text-content w-full"
      :class="{
        'sticky top-0': sticky,
        'bg-base-200/30': bg === 'base',
        'bg-neutral/50': bg === 'neutral',
        'bg-primary/50': bg === 'primary',
        'bg-secondary/50': bg === 'secondary',
        'bg-success/50': bg === 'success',
        'bg-warning/50': bg === 'warning',
        'bg-error/50': bg === 'error',
      }"
    >
      <h3 class="capitalize">{{ title }}</h3>
    </div>
    <ListGroup divider :overflow="false">
      <slot></slot>
    </ListGroup>
  </div>
</template>
