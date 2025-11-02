<script setup lang="ts">
import {
  convertBytes,
  formatFileSize,
  formatListDisjunction,
} from "@/utils/format";
import { ref } from "vue";

type FileUploadProps = {
  class?: string;
  multiple?: boolean;
  sizeLimit?: number;
  /**
   * Name of the input field
   */
  name?: string;
  /**
   * Comma seperated list of mime file types
   */
  accept?: ReadonlyArray<string>;
  /**
   * Max size in megabytes
   * @default 5 mb
   */
  maxSize?: number;
};

const props = withDefaults(defineProps<FileUploadProps>(), {
  name: "",
  accept: () => ["image/png", "image/jpg", "image/jpeg", "image/webp", ".pdf"],
  maxSize: 5,
});

const emit = defineEmits<{
  upload: [files: Array<File>];
}>();

const files = ref<File[]>([]);

const validateFile = (file: File) => {
  let fileError: { type: string; message: string } | undefined = undefined;

  if (file.size > convertBytes(props.maxSize, "megabytes", "bytes")) {
    fileError = {
      type: "oversized",
      message: `File is too large. ${`Max size is ${formatFileSize(
        convertBytes(props.maxSize, "megabytes", "bytes")
      )}.`}`,
    };
  }

  if (
    !props.accept
      .map((type) =>
        type
          .substring(type.indexOf("/") + "/".length)
          .toUpperCase()
          .replace(/[^a-zA-Z0-9]/g, "")
      )
      .includes(
        file.type.substring(file.type.indexOf("/") + "/".length).toUpperCase()
      )
  ) {
    fileError = {
      type: "invalidType",
      message: `Invalid file type.`,
    };
  }

  if (!/^(\w|\/|!|-|\.|\*|'|\(|\)| |&|\$|@|=|;|:|\+|,|\?)*$/.test(file.name)) {
    fileError = {
      type: "invalidCharacters",
      message: `File name contains invalid characters.`,
    };
  }

  return fileError;
};

const fileErrors = ref<{ type: string; message: string }[]>([]);

const handleFileChange = (e: Event) => {
  return new Promise(() => {
    const inputElement = e.target as HTMLInputElement;

    fileErrors.value = [];

    if (!inputElement?.files || !inputElement?.files?.length) return;

    files.value = Array.from(inputElement.files);

    Array.from(inputElement.files).forEach((file) => {
      const fileError = validateFile(file);

      if (fileError) {
        files.value = files.value.filter((f) => f !== file);
        fileErrors.value = [...fileErrors.value, fileError];
      }
    });

    emit("upload", files.value);
  });
};
</script>
<template>
  <div class="flex w-full items-center justify-center">
    <label
      for="dropzone-files"
      class="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed hover:border-opacity-100 dark:border-white border-black dark:border-opacity-50 border-opacity-5 transition-colors dark:hover:bg-zinc-700/20"
    >
      <div
        class="flex flex-col items-center justify-center pt-5 pb-6 will-change-contents"
      >
        <svg
          class="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
          />
        </svg>

        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <span v-if="accept">
            {{
              formatListDisjunction(
                accept.map((type) =>
                  type.substring(type.indexOf("/") + "/".length).toUpperCase()
                )
              )
            }}
          </span>

          <span v-if="maxSize">{{
            ` (Max. ${formatFileSize(
              convertBytes(maxSize, "megabytes", "bytes")
            )})`
          }}</span>
        </p>

        <p
          v-for="(error, idx) in fileErrors"
          :key="idx"
          class="mt-0.5 text-left text-xs leading-6 tracking-wide -mb-2 text-error"
        >
          {{ error.message }}
        </p>
      </div>

      <input
        ref="inputRef"
        id="dropzone-files"
        type="file"
        class="hidden"
        :accept="accept.join(', ')"
        :multiple="props.multiple"
        :size="convertBytes(maxSize, 'megabytes', 'bytes')"
        @change="handleFileChange"
        hidden
      />
    </label>
  </div>
</template>
