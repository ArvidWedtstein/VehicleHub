<script setup lang="ts" generic="T extends string">
type ExportType<T> = {
  extension: T;
  name: string;
};

type Props<T extends string> = {
  types?: ExportType<T>[];
};

withDefaults(defineProps<Props<T>>(), {
  types: () =>
    [
      { extension: "txt", name: "Text File" },
      { extension: "csv", name: "CSV File" },
    ] as ExportType<T>[],
});

const emit = defineEmits<{
  export: [type: T];
}>();

const handleExport = (type: T) => {
  emit("export", type);
};
</script>

<template>
  <Menu
    btnClass="btn btn-outline"
    alignMenu="end"
    :items="
      types.map((type) => ({
        label: type.name ?? type.extension,
        onClick: () => handleExport(type.extension),
      }))
    "
  >
    <template #default>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="w-4 fill-current"
      >
        <path
          d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
        />
      </svg>
      <span class="sm:block hidden">Export</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
        class="w-2 fill-current"
      >
        <path
          d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"
        />
      </svg>
    </template>
  </Menu>
</template>
