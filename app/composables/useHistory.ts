import { ref, watch, type Ref } from "vue";

export interface UseHistoryOptions<T> {
  /** track deep changes */
  deep?: boolean;
  /** maximum number of history entries */
  limit?: number;
  /** auto commit when value changes */
  autoCommit?: boolean;
}

export interface HistoryController<T> {
  value: Ref<T>;
  history: Ref<T[]>;
  pointer: Ref<number>;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: Ref<boolean>;
  canRedo: Ref<boolean>;
  clear: () => void;
}

export function useHistory<T>(
  initial: T,
  options: UseHistoryOptions<T> = {}
): HistoryController<T> {
  const { deep = false, limit = 50, autoCommit = true } = options;

  const value = ref<T>(initial) as Ref<T>;
  const history = shallowRef<T[]>([structuredClone(initial) as T]);
  const pointer = ref(0);

  const canUndo = ref(false);
  const canRedo = ref(false);

  const updateFlags = () => {
    canUndo.value = pointer.value > 0;
    canRedo.value = pointer.value < history.value.length - 1;
  };

  const commit = () => {
    // trim future history when committing
    if (pointer.value < history.value.length - 1) {
      history.value.splice(pointer.value + 1);
    }

    history.value = [...history.value, structuredClone(value.value) as T];

    // enforce limit
    if (history.value.length > limit) {
      history.value.shift();
    } else {
      pointer.value++;
    }

    updateFlags();
  };

  const undo = () => {
    if (!canUndo.value) return;
    pointer.value--;
    value.value = structuredClone(history.value[pointer.value]) as T;
    updateFlags();
  };

  const redo = () => {
    if (!canRedo.value) return;
    pointer.value++;
    value.value = structuredClone(history.value[pointer.value]) as T;
    updateFlags();
  };

  const clear = () => {
    history.value = [structuredClone(value.value)];
    pointer.value = 0;
    updateFlags();
  };

  if (autoCommit) {
    watch(
      value,
      () => {
        commit();
      },
      { deep }
    );
  }

  updateFlags();

  return {
    value,
    history,
    pointer,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
