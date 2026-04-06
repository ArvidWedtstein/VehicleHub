import { ref } from "vue";

const DEFAULTS: UseFileDialogOptions = {
  multiple: true,
  accept: "*",
  reset: false,
  directory: false,
};

export interface UseFileDialogOptions {
  accept?: MaybeRef<string>;
  /**
   * @default true
   */
  multiple?: MaybeRef<boolean>;
  /**
   * Select directories instead of files.
   * @see [HTMLInputElement webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
   * @default false
   */
  directory?: MaybeRef<boolean>;

  /**
   * Reset on open
   * @default false
   */
  reset?: MaybeRef<boolean>;

  /**
   * Initial files to set.
   * @default null
   */
  initialFiles?: Array<File> | FileList;

  /**
   * The input element for file dialog.
   * @default document.createElement('input')
   */
  input?: MaybeRef<HTMLInputElement>;

  onChange?: (files: FileList | null) => void;
  onCancel?: (event: Event) => void;
}

export interface UseFileDialogReturn {
  files: Ref<FileList | null>;
  isOpen: Ref<boolean>;
  open: () => void;
  reset: () => void;
}

function setInitialFiles(
  files: UseFileDialogOptions["initialFiles"],
): FileList | null {
  if (!files) return null;

  if (files instanceof FileList) return files;

  const dt = new DataTransfer();
  for (const file of files) {
    dt.items.add(file);
  }

  return dt.files;
}

/**
 * useFileDialog
 *
 * A composable for opening a native file picker dialog
 * and handling selected files reactively.
 *
 * @example
 * const { files, open, reset } = useFileDialog({ accept: 'image/*', multiple: true })
 */
export function useFileDialog(
  options: UseFileDialogOptions = {},
): UseFileDialogReturn {
  const files = ref<FileList | null>(setInitialFiles(options.initialFiles));
  const isOpen = ref(false);

  let input: HTMLInputElement | null = unref(options.input) || null;

  const createInput = (options: UseFileDialogOptions) => {
    input ??= document.createElement("input");
    input.type = "file";

    input.accept = toValue(options.accept)!;
    input.multiple = toValue(options.multiple)!;

    input.webkitdirectory = toValue(options.directory)!;

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      files.value = target.files;
      isOpen.value = false;
      options?.onChange?.(target.files);
    };

    input.oncancel = (e: Event) => {
      isOpen.value = false;
      options?.onCancel?.(e);
    };

    return input;
  };

  const open = (localOptions: Partial<UseFileDialogOptions> = {}) => {
    const mergedOptions = {
      ...DEFAULTS,
      ...options,
      ...localOptions,
    };

    const el = createInput(mergedOptions);

    isOpen.value = true;

    if (toValue(mergedOptions.reset)) {
      reset();
    }

    el.click();
  };

  const reset = () => {
    files.value = null;
    if (input) input.value = "";
  };

  return {
    files: readonly(files),
    isOpen,
    open,
    reset,
  };
}
