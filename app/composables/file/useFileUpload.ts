export interface UseFileUploadOptions {
  /**
   * e.g. 'image/*' or ['image/png', 'image/jpeg']
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept
   * @default '*'
   */
  accept?: MaybeRef<string>;

  reset?: MaybeRef<boolean>;
  multiple?: MaybeRef<boolean>;
  dropzone?: MaybeRef<boolean>;

  onUpdate: (files: File[]) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const {
    accept = "*",
    reset = false,
    multiple = false,
    dropzone = true,
    onUpdate,
  } = options;

  const inputRef = ref<ComponentPublicInstance>();
  const dropzoneRef = ref<HTMLDivElement>();

  const onDrop = (
    files: FileList | File[] | null,
    filesAreFromDropZone = false,
  ) => {
    if (!files || !files.length) {
      return;
    }

    if (files instanceof FileList) {
      files = Array.from(files);
    }
    if (files.length > 1 && !unref(multiple)) {
      files = [files[0]!];
    }

    if (filesAreFromDropZone && inputRef.value?.$el) {
      try {
        const dt = new DataTransfer();
        files.forEach((file) => dt.items.add(file));
        inputRef.value.$el.files = dt.files;
      } catch (e) {
        console.warn("Failed to sync files to input element:", e);
      }
    }

    onUpdate(files);
  };

  const isDragging = shallowRef(false);
  const fileDialog = reactive({
    open: () => {},
  });

  function open() {
    fileDialog.open();
  }

  onMounted(() => {
    const { isOver } = dropzone
      ? useDropZone(dropzoneRef, {
          accept: unref(accept),
          onDrop: (files) => onDrop(files, true),
        })
      : { isOver: ref(false) };

    watch(isOver, (value) => {
      isDragging.value = value;
    });

    const { open } = useFileDialog({
      accept,
      multiple,
      input: computed(() => unref(inputRef)?.$el),
      onChange: (fileList) => onDrop(fileList, false),
      reset,
    });

    fileDialog.open = open;
  });

  return {
    isDragging,
    open,
    inputRef,
    dropzoneRef,
  };
}
