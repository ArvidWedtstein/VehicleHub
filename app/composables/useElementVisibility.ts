export interface UseElementVisibilityOptions extends IntersectionObserverInit {
  immediate?: boolean;
  /**
   * The element that is used as the viewport for checking visibility of the target.
   */
  scrollTarget?: UseIntersectionObserverOptions["root"];
}

export function useElementVisibility(
  element: MaybeRef<HTMLElement | Element | null | undefined>,
  options: UseElementVisibilityOptions = {},
) {
  const { immediate = true, scrollTarget, ...observerOptions } = options;

  const isVisible = shallowRef(false);

  useIntersectionObserver(
    element,
    (intersectionObserverEntries) => {
      let isIntersecting = isVisible.value;

      let latestTime = 0;
      for (const entry of intersectionObserverEntries) {
        if (entry.time >= latestTime) {
          latestTime = entry.time;
          isIntersecting = entry.isIntersecting;
        }
      }
      isVisible.value = isIntersecting;
    },
    {
      ...observerOptions,
      root: scrollTarget,
    },
  );

  return isVisible;
}
