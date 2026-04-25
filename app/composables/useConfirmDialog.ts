import type { ButtonProps } from "@nuxt/ui";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

export interface ConfirmDialogOptions {
  title: string;
  description?: string;

  button?: Omit<ButtonProps, "size" | "onClick">;
}

export const useConfirmDialog = () => {
  const overlay = useOverlay();

  return (options: ConfirmDialogOptions): Promise<boolean> => {
    const modal = overlay.create(ConfirmDialog, {
      destroyOnClose: true,
      props: options,
    });

    return modal.open();
  };
};
