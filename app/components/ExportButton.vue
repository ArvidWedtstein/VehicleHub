<script setup lang="ts" generic="T extends string">
import type { DropdownMenuItem } from "@nuxt/ui";

type Props<T extends string> = {
  types?: T[];
};

const props = withDefaults(defineProps<Props<T>>(), {
  types: () => ["txt", "csv"] as T[],
});

const emit = defineEmits<{
  export: [type: T];
}>();

const options = computed<DropdownMenuItem[]>(() => {
  return props.types.map((type) => ({
    label: `${type.toUpperCase()} File`,
    icon: `mdi:file-document`,
    onSelect: () => emit("export", type),
  }));
});
</script>

<template>
  <UDropdownMenu :items="options">
    <UButton
      label="Export"
      icon="mdi:export"
      color="secondary"
      variant="outline"
    />
  </UDropdownMenu>
</template>
