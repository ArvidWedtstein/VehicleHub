import { onMounted, onBeforeUnmount, watch, type Ref } from "vue";

type MaybeRef<T> = T | Ref<T | null | undefined>;

export interface UseMutationObserverOptions extends MutationObserverInit {
  immediate?: boolean; // start observing on mount (default: true)
}

export function useMutationObserver(
  target: MaybeRef<Node | null | undefined>,
  callback: MutationCallback,
  options: UseMutationObserverOptions = {},
) {
  const { immediate = true, ...observerOptions } = options;

  let observer: MutationObserver | null = null;

  const getTarget = (): Node | null => {
    return (
      (target as Ref<Node | null | undefined>)?.value ?? (target as Node | null)
    );
  };

  const cleanup = () => {
    observer?.disconnect();
    observer = null;
  };

  const start = () => {
    const el = getTarget();
    if (!el || typeof window === "undefined") return;

    cleanup();

    observer = new MutationObserver(callback);
    observer.observe(el, observerOptions);
  };

  const stop = () => {
    cleanup();
  };

  // React if the target ref changes
  watch(
    () => getTarget(),
    () => {
      if (immediate) start();
    },
  );

  onMounted(() => {
    if (immediate) start();
  });

  onBeforeUnmount(stop);

  return {
    start,
    stop,
  };
}
