<script setup lang="ts">
import { reactive } from "vue";

const dragState = reactive({
  dragging: false,
});

const emit = defineEmits<{
  upload: [files: Array<File>];
}>();

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  dragState.dragging = true;
};

const onDragEnd = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  dragState.dragging = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();

  dragState.dragging = false;

  return new Promise(() => {
    const { dataTransfer } = e;

    if (!dataTransfer?.files.length) return;

    emit("upload", Array.from(dataTransfer.files));
  });
};
</script>

<template>
  <div
    class="transition-colors rounded-lg w-full border border-none"
    :class="{ 'bg-base-300/40 border-dashed': dragState.dragging }"
    @dragenter="onDragOver"
    @dragover="onDragOver"
    @dragend="onDragEnd"
    @dragleave="onDragEnd"
    @dragexit="onDragEnd"
    @drop="handleDrop"
  >
    <slot></slot>
  </div>
</template>
