type DropzoneOptions = {
  /**
   * e.g. 'image/*' or ['image/png', 'image/jpeg']
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept
   * @default '*'
   */
  accept?: string;
  /**
   * @default true
   */
  multiple?: boolean;
  disabled?: boolean;
  /**
   * @default true
   */
  preventDefaults?: boolean;

  maxSize?: number | string;

  onDrop?: (files: File[] | null, event: DragEvent) => void;
};

const DEFAULTS: DropzoneOptions = {
  multiple: true,
  preventDefaults: false,
  accept: "*",
};

export function useDropZone(
  target: MaybeRef<HTMLElement | Document | null | undefined>,
  options: DropzoneOptions = {},
) {
  const isClient =
    typeof window !== "undefined" && typeof document !== "undefined";

  const files = shallowRef<File[] | null>(null);
  const isOver = shallowRef(false);
  let isValid = true;

  if (isClient) {
    const mergedOptions = {
      ...DEFAULTS,
      options,
    };

    const getFiles = (event: DragEvent) => {
      const list = Array.from(event.dataTransfer?.files ?? []);
      return !list.length ? null : mergedOptions.multiple ? list : [list[0]!];
    };

    const validateAcceptTypes = (types: string[]) => {
      const dataTypes = parseAcceptToDataTypes(mergedOptions.accept || "*");
      if (!dataTypes?.length) return true;

      if (types.length === 0) return false;

      return types.every((type) =>
        dataTypes.some((allowedType) => type.includes(allowedType)),
      );
    };

    const checkValidity = (items: DataTransferItemList) => {
      const types = Array.from(items ?? []).map((item) => item.type);

      const dataTypesValid = validateAcceptTypes(types);
      const multipleFilesValid = mergedOptions.multiple || items.length <= 1;

      const maxSizeValid = mergedOptions.maxSize
        ? Array.from(items ?? []).every(
            (item) =>
              (item?.getAsFile()?.size || 0) <= Number(mergedOptions.maxSize),
          )
        : true;

      return dataTypesValid && multipleFilesValid && maxSizeValid;
    };

    const onDragEvent = (
      e: DragEvent,
      type: "enter" | "leave" | "over" | "drop",
    ) => {
      if (options.disabled) return;

      const dataTransferItemList = e.dataTransfer?.items;
      isValid =
        (dataTransferItemList && checkValidity(dataTransferItemList)) ?? false;

      if (mergedOptions.preventDefaults) {
        e.preventDefault();
      }

      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }

      const currentFiles = getFiles(e);

      switch (type) {
        case "enter":
        case "over":
          isOver.value = true;
          break;
        case "leave":
          isOver.value = false;
          break;
        case "drop":
          isOver.value = false;
          if (isValid) {
            files.value = currentFiles;
            mergedOptions.onDrop?.(currentFiles, e);
          } else {
            console.warn(
              "Dropped files do not meet the specified criteria and were rejected.",
            );
          }
          break;
      }
    };

    useEventListener(target, "dragenter", (e) => onDragEvent(e, "enter"));
    useEventListener(target, "dragleave", (e) => onDragEvent(e, "leave"));
    useEventListener(target, "dragover", (e) => onDragEvent(e, "over"));
    useEventListener(target, "drop", (e) => onDragEvent(e, "drop"));
  }

  return {
    /**
     * Dropped files
     */
    files,

    /**
     * Is dragging over dropzone
     */
    isOver,
  };
}
