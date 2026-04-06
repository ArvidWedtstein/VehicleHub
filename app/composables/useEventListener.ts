import { onMounted, onBeforeUnmount, unref, watch, type Ref } from "vue";

type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>;

export function useEventListener<
  T extends EventTarget,
  K extends keyof EventMap<T> & string,
>(
  target: MaybeRef<T | null | undefined>,
  event: K,
  handler: (ev: EventMap<T>[K]) => void,
  options?: AddEventListenerOptions | boolean,
) {
  let cleanup: (() => void) | undefined;

  const remove = () => {
    cleanup?.();
    cleanup = undefined;
  };

  const add = (el: T | null | undefined) => {
    if (!el) return;
    el.addEventListener(event, handler as EventListener, options);
    cleanup = () => {
      el.removeEventListener(event, handler as EventListener, options);
    };
  };

  const setup = () => {
    remove();
    const el = unref(target);
    add(el);
  };

  onMounted(setup);
  onBeforeUnmount(remove);

  // React if target ref changes
  if (typeof target === "object") {
    watch(() => unref(target), setup, { immediate: true });
  }

  return remove;
}
