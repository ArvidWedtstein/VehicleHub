<script setup lang="ts">
type Props = {
  files?: (File | { name: string; size: number; lastModified?: Date })[];
};

withDefaults(defineProps<Props>(), {
  files: () => [],
});

const emit = defineEmits<{
  fileClick: [file: File];
}>();
</script>

<template>
  <div
    class="table w-full table-auto rounded-lg border border-zinc-500 border-opacity-70 p-2 text-left"
  >
    <div class="table-header-group w-full text-xs text-base-content/70">
      <div class="table-cell p-1 max-w-3"></div>
      <div class="table-cell p-2 w-auto">Name</div>
      <div class="table-cell w-1/5 p-2">Size</div>
      <div class="hidden md:table-cell p-2">Last Modified</div>
      <div v-if="!!$slots.actions" class="table-cell p-2">Action</div>
    </div>

    <div class="table-row-group w-full" v-if="!files.length">
      <div class="table-cell max-w-3"></div>
      <div class="table-cell p-2 text-gray-400">No files uploaded yet</div>
      <div class="table-cell"></div>
      <div class="table-cell"></div>
      <div class="hidden md:table-cell"></div>
      <div v-if="!!$slots.actions" class="table-cell"></div>
    </div>
    <div
      v-for="(file, index) in files"
      class="table-row-group w-full text-xs text-base-content"
      :key="`file-${index}`"
    >
      <div class="table-cell max-w-3">
        <span
          class="truncate rounded-sm p-1 text-center align-middle text-xs uppercase text-base-content bg-neutral/20"
        >
          <slot name="fileIcon" :file="file">
            <span>{{ file?.name.split(".").pop() }}</span>
          </slot>
        </span>
      </div>
      <div
        class="table-cell w-auto sm:w-2/5 p-2 link-hover"
        @click="$emit('fileClick', file as File)"
      >
        {{ file?.name }}
      </div>
      <div class="table-cell p-2">
        {{
          formatFileSize(file?.size || 0, {
            maximumFractionDigits: 0,
            unitDisplay: "short",
          })
        }}
      </div>
      <div class="hidden md:table-cell truncate p-2">
        <NuxtTime
          :datetime="file?.lastModified || new Date()"
          dateStyle="medium"
        />
      </div>
      <div v-if="!!$slots.actions" class="table-cell align-middle relative">
        <slot name="actions" :file="file"></slot>
      </div>
    </div>
  </div>
</template>
