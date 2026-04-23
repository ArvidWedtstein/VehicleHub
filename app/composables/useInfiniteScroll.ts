import type { ComputedRef, UnwrapNestedRefs } from "vue";

function resolveElement(
  el: HTMLElement | SVGElement | Window | Document | null | undefined,
): HTMLElement | SVGElement | null | undefined {
  if (typeof Window !== "undefined" && el instanceof Window)
    return el.document.documentElement;

  if (typeof Document !== "undefined" && el instanceof Document)
    return el.documentElement;

  return el as HTMLElement | SVGElement | null | undefined;
}

type InfiniteScrollElement =
  | HTMLElement
  | SVGElement
  | Window
  | Document
  | null
  | undefined;

export interface UseInfiniteScrollOptions<
  T extends InfiniteScrollElement = InfiniteScrollElement,
> extends UseScrollOptions {
  /**
   * The minimum distance between the bottom of the element and the bottom of the viewport
   *
   * @default 0
   */
  distance?: number;

  /**
   * The direction in which to listen the scroll.
   *
   * @default 'bottom'
   */
  direction?: "top" | "bottom" | "left" | "right";

  /**
   * The interval time between two load more (to avoid too many invokes).
   *
   * @default 100
   */
  interval?: number;

  /**
   * A function that determines whether more content can be loaded for a specific element.
   * Should return `true` if loading more content is allowed for the given element,
   * and `false` otherwise.
   */
  canLoadMore?: (el: T) => boolean;
}

export interface UseInfiniteScrollReturn {
  isLoading: ComputedRef<boolean>;
  reset: () => void;
}

/**
 * Reactive infinite scroll.
 */
export function useInfiniteScroll<T extends InfiniteScrollElement>(
  element: MaybeRef<T>,
  onLoadMore: (
    state: UnwrapNestedRefs<UseScrollReturn>,
  ) => Promise<void> | void,
  options: UseInfiniteScrollOptions<T> = {},
): UseInfiniteScrollReturn {
  const {
    direction = "bottom",
    interval = 100,
    canLoadMore = () => true,
  } = options;

  const state = reactive(
    useScroll(element, {
      ...options,
      offset: {
        [direction]: options.distance ?? 0,
        ...options.offset,
      },
    }),
  );

  const promise = shallowRef<Promise<unknown> | null>();
  const isLoading = computed(() => !!promise.value);

  const observedElement = computed<HTMLElement | SVGElement | null | undefined>(
    () => {
      return resolveElement(toValue(element));
    },
  );

  const isElementVisible = useElementVisibility(observedElement);

  const canLoad = computed(() => {
    if (!observedElement.value) return false;
    return canLoadMore(observedElement.value as T);
  });

  function checkAndLoad() {
    state.measure();

    if (
      !observedElement.value ||
      !isElementVisible.value ||
      !canLoad.value ||
      promise.value
    )
      return;

    console.log("ænd checkAndLoad", direction, observedElement.value);

    const { scrollHeight, clientHeight, scrollWidth, clientWidth } =
      observedElement.value as HTMLElement;
    const isNarrower =
      direction === "bottom" || direction === "top"
        ? scrollHeight <= clientHeight
        : scrollWidth <= clientWidth;

    if (state.arrivedState[direction] || isNarrower) {
      promise.value = Promise.all([
        onLoadMore(state),
        new Promise((resolve) => setTimeout(resolve, interval)),
      ]).finally(() => {
        promise.value = null;
        nextTick(() => checkAndLoad());
      });
    }
  }

  const stop = watch(
    () => [
      state.arrivedState[direction],
      isElementVisible.value,
      canLoad.value,
    ],
    checkAndLoad,
    { immediate: true, flush: "post" },
  );

  onUnmounted(stop);

  return {
    isLoading,
    reset() {
      nextTick(() => checkAndLoad());
    },
  };
}
