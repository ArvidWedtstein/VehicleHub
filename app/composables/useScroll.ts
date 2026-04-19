import type { ShallowRef } from "vue";

export interface UseScrollOptions {
  /**
   * The check time when scrolling ends.
   * This configuration will be setting to (idle)
   *
   * @default 200
   */
  idle?: number;

  /**
   * Offset arrived states by x pixels
   *
   */
  offset?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };

  /**
   * Use MutationObserver to monitor specific DOM changes,
   * such as attribute modifications, child node additions or removals, or subtree changes.
   * @default { mutation: boolean }
   */
  observe?:
    | boolean
    | {
        mutation?: boolean;
      };

  /**
   * Trigger it when scrolling.
   *
   */
  onScroll?: (e: Event) => void;

  /**
   * Trigger it when scrolling ends.
   *
   */
  onStop?: (e: Event) => void;

  /**
   * Listener options for scroll event.
   *
   * @default {capture: false, passive: true}
   */
  eventListenerOptions?: boolean | AddEventListenerOptions;

  /**
   * Optionally specify a scroll behavior of `auto` (default, not smooth scrolling) or
   * `smooth` (for smooth scrolling) which takes effect when changing the `x` or `y` refs.
   *
   * @default 'auto'
   */
  behavior?: MaybeRefOrGetter<ScrollBehavior>;

  /**
   * On error callback
   *
   * Default log error to `console.error`
   */
  onError?: (error: unknown) => void;
}

export interface UseScrollReturn {
  x: WritableComputedRef<number>;
  y: WritableComputedRef<number>;
  isScrolling: ShallowRef<boolean>;
  arrivedState: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
  directions: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
  measure: () => void;
}

const ARRIVED_STATE_THRESHOLD_PIXELS = 1;

/**
 * Reactive scroll.
 *
 * @see https://vueuse.org/useScroll
 * @param element
 * @param options
 */
export function useScroll(
  element: MaybeRef<
    HTMLElement | SVGElement | Window | Document | null | undefined
  >,
  options: UseScrollOptions = {},
): UseScrollReturn {
  const {
    idle = 200,
    onStop = () => {},
    onScroll = () => {},
    offset = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    observe: _observe = {
      mutation: false,
    },
    eventListenerOptions = {
      capture: false,
      passive: true,
    },
    behavior = "auto",
    onError = (e) => {
      console.error(e);
    },
  } = options;

  const observe =
    typeof _observe === "boolean"
      ? {
          mutation: _observe,
        }
      : _observe;

  const internalX = shallowRef(0);
  const internalY = shallowRef(0);

  // Use a computed for x and y because we want to write the value to the refs
  // during a `scrollTo()` without firing additional `scrollTo()`s in the process.
  const x = computed({
    get() {
      return internalX.value;
    },
    set(x) {
      scrollTo(x, undefined);
    },
  });

  const y = computed({
    get() {
      return internalY.value;
    },
    set(y) {
      scrollTo(undefined, y);
    },
  });

  function scrollTo(_x: number | undefined, _y: number | undefined) {
    if (!window) return;

    const _element = toValue(element);
    if (!_element) return;

    (_element instanceof Document ? window.document.body : _element)?.scrollTo({
      top: toValue(_y) ?? y.value,
      left: toValue(_x) ?? x.value,
      behavior: toValue(behavior),
    });
    const scrollContainer =
      (_element as Window)?.document?.documentElement ||
      (_element as Document)?.documentElement ||
      (_element as Element);
    if (x != null) internalX.value = scrollContainer.scrollLeft;
    if (y != null) internalY.value = scrollContainer.scrollTop;
  }

  const isScrolling = shallowRef(false);
  const arrivedState = reactive({
    left: true,
    right: false,
    top: true,
    bottom: false,
  });
  const directions = reactive({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });

  const onScrollEnd = (e: Event) => {
    // dedupe if support native scrollend event
    if (!isScrolling.value) return;

    isScrolling.value = false;
    directions.left = false;
    directions.right = false;
    directions.top = false;
    directions.bottom = false;
    onStop(e);
  };
  const onScrollEndDebounced = debounce(onScrollEnd, idle);

  const setArrivedState = (
    target: HTMLElement | SVGElement | Window | Document | null | undefined,
  ) => {
    if (!window) return;

    const el: Element = ((target as Window)?.document?.documentElement ||
      (target as Document)?.documentElement ||
      toValue(target as HTMLElement | SVGElement)) as Element;

    const { display, flexDirection, direction } = window.getComputedStyle(el);
    const directionMultipler = direction === "rtl" ? -1 : 1;

    const scrollLeft = el.scrollLeft;
    directions.left = scrollLeft < internalX.value;
    directions.right = scrollLeft > internalX.value;

    const left =
      Math.abs(scrollLeft * directionMultipler) <= (offset.left || 0);
    const right =
      Math.abs(scrollLeft * directionMultipler) + el.clientWidth >=
      el.scrollWidth - (offset.right || 0) - ARRIVED_STATE_THRESHOLD_PIXELS;

    if (display === "flex" && flexDirection === "row-reverse") {
      arrivedState.left = right;
      arrivedState.right = left;
    } else {
      arrivedState.left = left;
      arrivedState.right = right;
    }

    internalX.value = scrollLeft;

    let scrollTop = el.scrollTop;

    // patch for mobile compatible
    if (target === window.document && !scrollTop)
      scrollTop = window.document.body.scrollTop;

    directions.top = scrollTop < internalY.value;
    directions.bottom = scrollTop > internalY.value;
    const top = Math.abs(scrollTop) <= (offset.top || 0);
    const bottom =
      Math.abs(scrollTop) + el.clientHeight >=
      el.scrollHeight - (offset.bottom || 0) - ARRIVED_STATE_THRESHOLD_PIXELS;

    /**
     * reverse columns and rows behave exactly the other way around,
     * bottom is treated as top and top is treated as the negative version of bottom
     */
    if (display === "flex" && flexDirection === "column-reverse") {
      arrivedState.top = bottom;
      arrivedState.bottom = top;
    } else {
      arrivedState.top = top;
      arrivedState.bottom = bottom;
    }

    internalY.value = scrollTop;
  };

  const onScrollHandler = (e: Event) => {
    if (!window) return;

    const eventTarget = ((e.target as Document).documentElement ??
      e.target) as HTMLElement;

    setArrivedState(eventTarget);

    isScrolling.value = true;
    onScrollEndDebounced(e);
    onScroll(e);
  };

  useEventListener(element, "scroll", onScrollHandler, eventListenerOptions);

  onMounted(() => {
    try {
      const _element = toValue(element);
      if (!_element) return;
      setArrivedState(_element);
    } catch (e) {
      onError(e);
    }
  });

  if (
    observe?.mutation &&
    element != null &&
    element !== window &&
    element !== document
  ) {
    useMutationObserver(
      element as MaybeRef<HTMLElement | SVGElement>,
      () => {
        const _element = toValue(element);
        if (!_element) return;
        setArrivedState(_element);
      },
      {
        attributes: true,
        childList: true,
        subtree: true,
      },
    );
  }

  useEventListener(element, "scrollend", onScrollEnd, eventListenerOptions);

  return {
    x,
    y,
    isScrolling,
    arrivedState,
    directions,
    measure() {
      const _element = toValue(element);

      if (window && _element) setArrivedState(_element);
    },
  };
}
