<script setup lang="ts" generic="M extends boolean = false">
export interface FileUploadProps<M extends boolean = false> {
  label?: string;
  description?: string;

  multiple?: M & boolean;

  /**
   * Specifies the allowed file types for the input. Provide a comma-separated list of MIME types or file extensions (e.g., "image/png,application/pdf,.jpg").
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept
   * @defaultValue '*'
   */
  accept?: string;
  /**
   * Max file size in bytes. If a number is provided, it will be used as the maximum file size for uploads.
   */
  maxSize?: number;
  /**
   * @default false
   */
  reset?: boolean;

  disabled?: boolean;

  dropzone?: boolean;

  /**
   * Preview the file
   * @default true
   */
  fileImage?: boolean;

  fileDelete?: boolean;

  fileIcon?: string;

  /**
   * Preview after upload
   * @default true
   */
  preview?: boolean;

  icon?: string;

  class?: any;
}

export interface FileUploadEmits {
  change: [event: Event];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FileUploadProps<M>>(), {
  icon: "mdi:upload",

  accept: "*",
  multiple: false as never,
  reset: false,
  dropzone: true,

  fileImage: true,
  fileDelete: true,

  preview: true,
});

const emits = defineEmits<FileUploadEmits>();

const modelValue = defineModel<(M extends true ? File[] : File) | null>();

const { accept, multiple, reset } = toRefs(props);

const { isDragging, open, inputRef, dropzoneRef } = useFileUpload({
  accept,
  reset,
  multiple: multiple as MaybeRef<boolean>,
  maxSize: props.maxSize,
  dropzone: props.dropzone,
  onUpdate,
});

function onUpdate(files: File[], reset = false) {
  if (props.multiple) {
    if (reset) {
      modelValue.value = files as (M extends true ? File[] : File) | null;
    } else {
      const existingFiles = (modelValue.value as File[]) || [];
      modelValue.value = [...existingFiles, ...(files || [])] as
        | (M extends true ? File[] : File)
        | null;
    }
  } else {
    modelValue.value = (files?.[0] ?? null) as
      | (M extends true ? File[] : File)
      | null;
  }

  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value: modelValue.value } });
  emits("change", event);
}

const removeFile = (index?: number) => {
  if (!modelValue.value) {
    return;
  }

  if (!props.multiple || index === undefined) {
    onUpdate([], true);

    dropzoneRef.value?.focus();
    return;
  }

  const files = [...(modelValue.value as File[])];
  files.splice(index, 1);

  onUpdate(files, true);

  dropzoneRef.value?.focus();
};

function createObjectUrl(file: File) {
  if (!props.fileImage) return undefined;
  return URL.createObjectURL(file);
}

watch(modelValue, (newValue) => {
  const hasModelReset = props.multiple
    ? !(newValue as File[])?.length
    : !newValue;

  if (hasModelReset && inputRef.value?.$el) {
    inputRef.value.$el.value = "";
  }
});

defineExpose({
  inputRef: toRef(() => inputRef.value?.$el as HTMLInputElement),
  dropzoneRef,
});
</script>

<template>
  <div class="relative flex flex-col gap-2 items-start" :class="class">
    <slot :open="open" :removeFile="removeFile">
      <div
        ref="dropzoneRef"
        role="button"
        :data-dragging="isDragging"
        :tabindex="!disabled ? 0 : -1"
        @click="!disabled && open()"
        @keydown.space.prevent
        @keyup.enter.space="!disabled && open()"
        class="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed hover:border-opacity-100 border-base-content/50 transition-colors hover:bg-base-content/10 data-[dragging=true]:bg-base-content/10"
      >
        <span
          v-if="icon || $slots.icon"
          class="inline-flex items-center justify-center select-none rounded-full align-middle bg-neutral text-white size-8 text-base shrink-0"
        >
          <slot name="icon">
            <Icon :name="icon" />
          </slot>
        </span>

        <div v-if="label || !!$slots.label" class="font-medium text-base mt-2">
          <slot name="label">
            {{ label }}
          </slot>
        </div>
        <div
          v-if="description || !!$slots.description"
          class="mt-1 text-base-content/70"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>

        <div v-if="!!$slots.actions">
          <slot
            name="actions"
            :files="modelValue"
            :open="open"
            :removeFile="removeFile"
          />
        </div>
      </div>

      <template
        v-if="
          preview &&
          modelValue &&
          (Array.isArray(modelValue) ? modelValue.length : true)
        "
      >
        <div class="flex flex-col w-full gap-2">
          <slot name="files" :files="modelValue" :removeFile="removeFile">
            <div
              v-for="(file, index) in Array.isArray(modelValue)
                ? modelValue
                : [modelValue]"
              :key="(file as File).name"
              class="relative text-xs px-2.5 py-1.5 gap-1.5 min-w-0 flex items-center border border-neutral rounded-md w-full"
            >
              <slot name="file" :file="file" :index="index">
                <slot name="fileLeading" :file="file" :index="index">
                  <AvatarImage
                    size="xs"
                    :src="createObjectUrl(file)"
                    fallbackSrc=""
                    #fallback
                  >
                    <Icon v-if="fileIcon" :name="fileIcon" size="1.6em" />
                  </AvatarImage>
                </slot>

                <div class="flex flex-col min-w-0">
                  <slot name="fileName" :file="file" :index="index">
                    <span class="truncate">
                      {{ (file as File).name }}
                    </span>
                  </slot>

                  <slot name="fileSize" :file="file" :index="index">
                    <span class="text-base-content/70 truncate">
                      {{ formatFileSize((file as File).size) }}
                    </span>
                  </slot>
                </div>

                <slot name="fileTrailing" :file="file" :index="index">
                  <button
                    v-if="fileDelete"
                    type="button"
                    class="btn btn-sm btn-square btn-neutral ms-auto"
                    @click.stop.prevent="removeFile(index)"
                  >
                    <Icon name="mdi:close" />
                  </button>
                </slot>
              </slot>
            </div>
          </slot>
        </div>
      </template>
    </slot>

    <input
      ref="inputRef"
      type="file"
      class="invisible hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      v-bind="$attrs"
    />
  </div>
</template>
