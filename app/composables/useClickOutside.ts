import { watch, onMounted, onBeforeUnmount, type Ref } from "vue";

/**
 * Modes for auto-closing the dropdown.
 * - "always" - Close on any click (inside or outside).
 * - "inside" - Close only when clicked inside the target element.
 * - "outside" - Close only when clicked outside the target element.
 * - "none" - Never auto-close.
 */
export type AutoCloseMode = "always" | "inside" | "outside" | "none";

/**
 * Composable to detect clicks inside or outside a target element.
 *
 * @param targetRef - A reference to the target element.
 * @param handler - A function to run based on the auto-close mode.
 * @param mode - The auto-close mode (default is 'always').
 */
export function useClickOutside(
  targetRef: Ref<HTMLElement | null>,
  handler: (event: MouseEvent, isInside: boolean) => void,
  mode: AutoCloseMode = "always"
) {
  let skipNextClick = false;

  const handleClick = (event: MouseEvent) => {
    if (skipNextClick) {
      skipNextClick = false;
      return;
    }

    const target = targetRef.value;
    if (!target) return;

    const clickedInside = target.contains(event.target as Node);

    if (
      mode === "always" ||
      (mode === "inside" && clickedInside) ||
      (mode === "outside" && !clickedInside)
    ) {
      handler(event, clickedInside);
    }
  };

  const skipNextClickEvent = () => {
    skipNextClick = true;
  };

  const addListeners = () => {
    document.addEventListener("pointerdown", handleClick);
  };

  const removeListeners = () => {
    document.removeEventListener("pointerdown", handleClick);
  };

  onMounted(addListeners);
  onBeforeUnmount(removeListeners);

  // Watch for dynamic mode changes and reapply listeners
  watch(
    () => mode,
    () => {
      removeListeners();
      addListeners();
    }
  );

  return { skipNextClickEvent };
}
