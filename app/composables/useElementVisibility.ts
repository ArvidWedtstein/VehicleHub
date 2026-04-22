import { ref, watch, onMounted, onBeforeUnmount, type Ref } from "vue";

type MaybeRef<T> = T | Ref<T | null | undefined>;

export interface UseElementVisibilityOptions extends IntersectionObserverInit {
  immediate?: boolean; // start on mount (default: true)
}

export function useElementVisibility(
  target: MaybeRef<Element | null | undefined>,
  options: UseElementVisibilityOptions = {},
) {
  const { immediate = true, ...observerOptions } = options;

  const isVisible = ref(false);
  const entry = ref<IntersectionObserverEntry | null>(null);

  let observer: IntersectionObserver | null = null;

  const getTarget = (): Element | null => {
    return (
      (target as Ref<Element | null | undefined>)?.value ??
      (target as Element | null)
    );
  };

  const cleanup = () => {
    observer?.disconnect();
    observer = null;
  };

  const start = () => {
    const el = getTarget();
    console.log("Starting useElementVisibility", el);
    if (!el || typeof window === "undefined") return;

    cleanup();

    observer = new IntersectionObserver(([e]) => {
      entry.value = e || null;
      isVisible.value = e?.isIntersecting || false;
    }, observerOptions);

    observer.observe(el);
  };

  const stop = () => {
    cleanup();
  };

  watch(
    () => getTarget(),
    () => {
      console.log("Target changed for useElementVisibility", getTarget());
      if (immediate) start();
    },
  );

  onMounted(() => {
    if (immediate) start();
  });

  onBeforeUnmount(stop);

  return {
    isVisible,
    entry,
    start,
    stop,
  };
}
