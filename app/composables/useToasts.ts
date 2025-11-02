import { ref } from "vue";

export type Severity =
  | "default"
  | "success"
  | "info"
  | "error"
  | "warning"
  | "loading";

export type ToastType =
  | "blank"
  | "success"
  | "info"
  | "error"
  | "warning"
  | "loading";

export type ToastOptions = {
  timeout?: number;
  icon?: string;
  class?: string;
};

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  options?: ToastOptions;
}

const toastTimeoutDefaults: Record<ToastType, number> = {
  blank: 4000,
  success: 2000,
  info: 3000,
  error: 4000,
  warning: 4000,
  loading: Infinity,
};

const toasts = ref<Toast[]>([]);
let id = 0;

const add = (
  message: string,
  type: ToastType = "info",
  options: ToastOptions = {}
) => {
  const toastId = ++id;
  const duration = options.timeout ?? toastTimeoutDefaults[type] ?? 0;

  const toast: Toast = {
    id: toastId,
    message,
    type,
    options: {
      ...options,
      timeout: duration,
    },
  };
  toasts.value.push(toast);

  if (duration > 0 && isFinite(duration)) {
    setTimeout(() => remove(toastId), duration);
  }

  return toastId;
};

const remove = (toastId: number) => {
  toasts.value = toasts.value.filter((t) => t.id !== toastId);
};

const removeAll = () => {
  toasts.value = [];
};

const update = (
  toastId: number,
  message: string,
  type: ToastType = "info",
  options: ToastOptions = {}
) => {
  const idx = toasts.value.findIndex((t) => t.id === toastId);

  const duration = options.timeout ?? toastTimeoutDefaults[type] ?? 0;
  if (idx !== -1) {
    toasts.value[idx] = {
      ...toasts.value[idx],
      id: toastId,
      message,
      type,
      options: { ...(toasts.value[idx]?.options || {}), timeout: duration },
    };
  }
};

export function useToasts() {
  return { toasts, add, remove, removeAll, update };
}

/**
 * Global toast API
 */
const call =
  (type: ToastType) =>
  (message: string, options: ToastOptions = {}) =>
    add(message, type, options);

export const toast = Object.assign(
  (message: string, options: ToastOptions = {}) =>
    add(message, "blank", options),
  {
    success: call("success"),
    error: call("error"),
    warning: call("warning"),
    info: call("info"),
    loading: call("loading"),

    dismiss: (toastId?: number) => {
      if (!toastId) removeAll();
      else remove(toastId);
    },

    promise: async <T>(
      promiseFn: () => Promise<T>,
      messages: { loading: string; success: string; error: string },
      options: ToastOptions = {}
    ): Promise<T | null> => {
      const id = add(messages.loading, "loading", options);

      try {
        const result = await promiseFn();
        update(id, messages.success, "success", options);
        return result;
      } catch (err) {
        console.error(err);
        update(id, messages.error, "error", options);
        return null;
      }
    },
  }
);
