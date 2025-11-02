import { reactive } from "vue";

type Confirm = {
  title?: string;
  message?: string;
  severity?: "default" | "danger" | "warning" | "success" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
};

const confirmState = reactive<
  Confirm & { visible: boolean; resolve: null | ((value: unknown) => void) }
>({
  visible: false,
  title: "",
  message: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  severity: "default",
  resolve: null,
});

/**
 *
 * Before using confirm, watch this: https://www.instagram.com/p/DAQf2QEAT7Z/
 *
 * Example:
 * Use 'Delete Folder' instead of 'Are you sure?'
 * @returns confirmation dialog
 */
export const useConfirm = ({
  title,
  message,
  severity,
  confirmLabel,
  cancelLabel,
}: Confirm) => {
  confirmState.title = title || "";
  confirmState.message = message || "";
  confirmState.severity = severity || "default";
  confirmState.confirmLabel = confirmLabel || "Confirm";
  confirmState.cancelLabel = cancelLabel || "Cancel";
  confirmState.visible = true;

  return new Promise((resolve) => {
    confirmState.resolve = resolve;
  });
};

export const setupConfirm = () => {
  const confirm = () => {
    confirmState.visible = false;
    confirmState.resolve?.(true);
  };

  const cancel = () => {
    confirmState.visible = false;
    confirmState.resolve?.(false);
  };

  return { confirmState, confirm, cancel };
};
