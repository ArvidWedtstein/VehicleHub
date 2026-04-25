import type { ShallowRef } from "vue";

type MaybeEl =
  | Element
  | HTMLElement
  | SVGElement
  | ComponentPublicInstance
  | undefined
  | null;
type unRefElementReturn<T extends MaybeEl> = T extends ComponentPublicInstance
  ? Exclude<MaybeEl, ComponentPublicInstance>
  : T | undefined;

const unrefElement = <T extends MaybeEl>(
  el: MaybeRef<T>,
): unRefElementReturn<T> => {
  const plain = toValue(el);
  return (plain as ComponentPublicInstance)?.$el ?? plain;
};

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * Start observing immediately
   * @default true
   */
  immediate?: boolean;
}

export interface UseIntersectionObserverReturn {
  isSupported: ComputedRef<boolean>;
  isActive: ShallowRef<boolean>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useIntersectionObserver(
  target: MaybeRef<Element | null | undefined>,
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn {
  const { root, rootMargin = "0px", threshold = 0, immediate = true } = options;

  const isActive = shallowRef(immediate);

  const targets = computed(() => {
    const _target = toValue(target);
    return (Array.isArray(_target) ? _target : [_target])
      .map(unrefElement)
      .filter((el) => el != null);
  });

  const isSupported = computed(() => {
    return typeof window !== "undefined" && "IntersectionObserver" in window;
  });

  let cleanup = () => {};

  const stopWatch = isSupported.value
    ? watch(
        () =>
          [
            targets.value,
            unrefElement(root as MaybeRef<Element | null | undefined>),
            toValue(rootMargin),
            isActive.value,
          ] as const,
        ([targets, root, rootMargin]) => {
          cleanup();
          if (!isActive.value) return;

          if (!targets.length) return;

          const observer = new IntersectionObserver(callback, {
            root: unrefElement(root),
            rootMargin,
            threshold,
          });

          targets.forEach((el) => el && observer.observe(el));

          cleanup = () => {
            observer.disconnect();
            cleanup = () => {};
          };
        },
        { immediate, flush: "post" },
      )
    : () => {};

  const stop = () => {
    cleanup();
    stopWatch();
    isActive.value = false;
  };

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return {
    isSupported,
    isActive,
    pause() {
      cleanup();
      isActive.value = false;
    },
    resume() {
      isActive.value = true;
    },
    stop,
  };
}
