<script setup lang="ts">
type Props = {
  title?: string;
  /** Default left */
  direction?: "bottom" | "top" | "left" | "right";
  drawerClasses?: string;

  dismissible?: boolean;

  /** Disable swipe to close */
  disableSwipe?: boolean;

  /** Enables handle */
  handle?: boolean;
  /** When true, drawer is only allowed to be dragged from handle */
  handleOnly?: boolean;
  overlay?: boolean;

  /**
   * Array of 0 to 100 corresponding to % of screen.
   */
  snapPoints?: (string | number)[];

  /**
   * Determines when the drawer should be closed.
   * 0.5 would mean drawer will be closed when user has swiped 50% of screen.
   */
  closeThreshold?: number;

  inset?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  direction: "right",
  handle: true,
  overlay: true,

  closeThreshold: 0.5,

  dismissible: true,
  inset: false,
});

const emit = defineEmits<{
  shown: [reason?: string];
  hidden: [reason?: string];

  snap: [snapPoint?: string | number];
}>();

const drawerOpen = defineModel<boolean>("open", {
  default: false,
});

const activeSnapPoint = defineModel<string | number>("activeSnapPoint", {
  required: false,
});

const drawerRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);

const id = useId();

const isDragging = ref(false);

const snapPointsPx = ref<number[]>([]);
const currentSnapPx = ref(0);

const screenSize = ref(0);
const startPointer = ref(0);

const drawerSize = ref(0);

const dragStartTime = ref<Date | null>(null);
const dragEndTime = ref<Date | null>(null);

const setStyle = (
  element: HTMLElement | null,
  styles: { [k: string]: string },
) => {
  if (!element) return;
  const originalStyles: { [k: string]: string } = {};

  Object.entries(styles).forEach(([key, value]: [string, string]) => {
    if (key.startsWith("--")) {
      element.style.setProperty(key, value);
      return;
    }

    originalStyles[key] = (element.style as any)[key];
    (element.style as any)[key] = value;
  });
};

const {
  activeSnapPointIdx,
  onReleaseSnapPoints,
  snapPointsOffset,
  onDrag: onDragSnapPoints,
} = useSnapPoints({
  snapPoints: toRef(props, "snapPoints"),
  activeSnapPoint,
  drawerRef,
  onSnapPointChange: (snap) => {
    console.log("snappoint changed!", snap);
  },
  direction: toRef(props, "direction"),
});

const isVertical = computed(
  () => props.direction === "top" || props.direction === "bottom",
);

const snapPointHeight = computed(() => {
  if (snapPointsOffset.value && snapPointsOffset.value.length > 0)
    return `${snapPointsOffset.value[0]}px`;

  return "0";
});

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const updateSizes = () => {
  screenSize.value = isVertical.value ? window.innerHeight : window.innerWidth;

  const snaps = (props.snapPoints ?? [0, 1]).map(
    (p) => clamp(Number(p) || 0, 0, 1) * screenSize.value,
  );
  // ensure 0 and max present
  const set = Array.from(new Set([...snaps, 0, screenSize.value])).sort(
    (a, b) => a - b,
  );
  snapPointsPx.value = set;
  // if currentSnapPx is outside bounds, snap to nearest valid
  const minPx = 0;
  const maxPx = screenSize.value;
  if (currentSnapPx.value < minPx || currentSnapPx.value > maxPx) {
    const nearest = findNearestSnap(currentSnapPx.value);
    currentSnapPx.value = nearest || 0;
  }
};

// ============ Snap + helpers ============

const findNearestSnap = (value: number, considerVelocity = false) => {
  let nearest = snapPointsPx.value[0];
  let bestDist = Infinity;
  for (const s of snapPointsPx.value) {
    const d = Math.abs(s - value);
    if (d < bestDist) {
      bestDist = d;
      nearest = s;
    }
  }
  return nearest;
};

// ============ Drawer lifecycle helpers ============
const toggleDrawer = async (open: boolean, reason?: string) => {
  drawerOpen.value = open;

  await nextTick();

  if (open) {
    emit("shown", reason);
  } else {
    currentSnapPx.value = 0;

    if (props.snapPoints) {
      activeSnapPoint.value = props.snapPoints[0];
    }
    emit("hidden", reason);
  }
};

// ============ Pointer logic ============
const getCoord = (ev: PointerEvent | TouchEvent) => {
  if ("touches" in ev)
    return isVertical.value
      ? ev.touches[0]?.clientY || 0
      : ev.touches[0]?.clientX || 0;

  return isVertical.value ? ev.clientY : ev.clientX;
};

const startDrag = (ev: PointerEvent) => {
  if (!drawerRef.value) return;

  isDragging.value = true;
  startPointer.value = getCoord(ev);

  dragStartTime.value = new Date();

  try {
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
  } catch {}

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
};

const onPointerMove = (ev: PointerEvent) => {
  if (!isDragging.value) return;

  const directionMultiplier =
    props.direction === "bottom" || props.direction === "right" ? 1 : -1;
  const draggedDistance =
    (startPointer.value - getCoord(ev)) * directionMultiplier;

  const isDraggingInDirection = draggedDistance > 0;

  const noCloseSnapPointsPreCondition =
    props.snapPoints && !props.dismissible && !isDraggingInDirection;

  if (noCloseSnapPointsPreCondition && !activeSnapPointIdx.value) return;

  const absDraggedDistance = Math.abs(draggedDistance);

  if (props.snapPoints) {
    onDragSnapPoints({ draggedDistance });
  }

  if (isDraggingInDirection && !props.snapPoints) {
    const dampenedDraggedDistance = 8 * (Math.log(draggedDistance + 1) - 2);

    const translateValue =
      Math.min(dampenedDraggedDistance * -1, 0) * directionMultiplier;

    setStyle(drawerRef.value, {
      transform: isVertical.value
        ? `translate3d(0, ${translateValue}px, 0)`
        : `translate3d(${translateValue}px, 0, 0)`,
    });

    return;
  }

  if (!props.snapPoints) {
    const translateValue = absDraggedDistance * directionMultiplier;

    setStyle(drawerRef.value, {
      transform: isVertical.value
        ? `translate3d(0, ${translateValue}px, 0)`
        : `translate3d(${translateValue}px, 0, 0)`,
    });
  }
};

const getMatrix = (element: HTMLElement): number | null => {
  const elemenetStyle = window.getComputedStyle(element);

  const transform =
    elemenetStyle.transform ||
    elemenetStyle.webkitTransform ||
    // @ts-ignore
    elemenetStyle.mozTransform;
  let matrix = transform.match(/^matrix3d\((.+)\)$/);
  if (matrix) {
    return Number.parseFloat(matrix[1].split(", ")[isVertical.value ? 13 : 12]);
  }

  matrix = transform.match(/^matrix\((.+)\)$/);
  return matrix
    ? Number.parseFloat(matrix[1].split(", ")[isVertical.value ? 5 : 4])
    : null;
};

const onPointerUp = (ev: PointerEvent) => {
  if (!isDragging.value || !drawerRef.value) return;

  isDragging.value = false;
  dragEndTime.value = new Date();

  const swipeAmount = getMatrix(drawerRef.value) || 0;

  if (dragStartTime.value === null) return;

  const distMoved = startPointer.value - getCoord(ev);

  const timeTaken = dragEndTime.value.getTime() - dragStartTime.value.getTime();
  const velocity = Math.abs(distMoved) / timeTaken;

  try {
    (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
  } catch (e) {}

  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);

  if (props.snapPoints) {
    const directionMultiplier =
      props.direction === "bottom" || props.direction === "right" ? 1 : -1;

    onReleaseSnapPoints({
      draggedDistance: distMoved * directionMultiplier,
      closeDrawer: () => toggleDrawer(false),
      velocity,
      dismissible: props.dismissible,
    });

    return;
  }

  if (
    props.direction === "bottom" || props.direction === "right"
      ? distMoved > 0
      : distMoved < 0
  ) {
    resetDrawer();
    return;
  }

  if (velocity > props.closeThreshold) {
    toggleDrawer(false);
    return;
  }

  const visibleDrawerHeight = Math.min(
    drawerRef.value.getBoundingClientRect().height ?? 0,
    window.innerHeight,
  );

  console.log(
    "visible",
    swipeAmount,
    visibleDrawerHeight * props.closeThreshold,
  );
  if (swipeAmount >= visibleDrawerHeight * props.closeThreshold) {
    toggleDrawer(false);
    return;
  }

  resetDrawer();
};

const onHandlePointerDown = (ev: PointerEvent) => startDrag(ev);
const onContainerPointerDown = (ev: PointerEvent) => {
  if (props.handleOnly) return;
  startDrag(ev);
};

const resetDrawer = () => {
  if (!drawerRef.value) return;

  setStyle(drawerRef.value, {
    transform: "translate3d(0, 0, 0)",
  });
};

// ============ Computed classes/styles ============
const drawerClass = computed(() => {
  let baseClass = "";

  switch (props.direction) {
    case "top":
      baseClass =
        "flex-col-reverse top-0 left-0 w-full h-auto rounded-b-box mb-24";
      break;
    case "bottom":
      baseClass = "flex-col h-auto w-auto max-h-[96%] rounded-t-box mt-24"; //  bottom-0 left-0
      break;
    case "left":
      baseClass = "flex-row-reverse top-0 left-0 h-full w-auto rounded-r-box";
      break;
    case "right":
      baseClass = "flex-row top-0 right-0 h-full w-auto rounded-l-box";
      break;
    default:
      baseClass = "";
  }

  if (props.inset) {
    switch (props.direction) {
      case "top":
        baseClass +=
          " rounded-t-box inset-x-4 top-4 overflow-hidden after:hidden";
        break;
      case "bottom":
        baseClass +=
          " rounded-b-box inset-x-4 bottom-4 overflow-hidden after:hidden";
        break;
      case "left":
        baseClass += " rounded-l-box inset-y-4 left-4 after:hidden";
        break;
      case "right":
        baseClass += " rounded-r-box inset-y-4 right-4 after:hidden";
        break;
    }
  }
  return baseClass;
});

const handlePositionClass = computed(() => {
  switch (props.direction) {
    case "top":
      return "mb-4 w-12! h-1.5! mx-auto cursor-ns-resize";
    case "bottom":
      return "mt-4 w-12! h-1.5! mx-auto cursor-ns-resize";
    case "left":
      return "mr-4! h-12! w-1.5! mt-auto mb-auto cursor-ew-resize";
    case "right":
      return "ml-4! h-12! w-1.5! mt-auto mb-auto cursor-ew-resize";
    default:
      return "";
  }
});

let resizeObserver: ResizeObserver;

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (!drawerRef.value) return;
    const rect = drawerRef.value.getBoundingClientRect();
    drawerSize.value =
      props.direction === "left" || props.direction === "right"
        ? rect.width
        : rect.height;
  });

  nextTick(() => {
    updateSizes();
  });

  if (drawerRef.value) resizeObserver.observe(drawerRef.value);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);

  isDragging.value = false;

  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(drawerOpen, (open) => {
  isDragging.value = false;
  if (open) {
    updateSizes();
  }
});

defineExpose({
  open: (reason?: string) => toggleDrawer(true, reason),
  close: (reason?: string) => toggleDrawer(false, reason),
});
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50" :class="{ invisible: !drawerOpen }">
      <!-- Backdrop -->
      <Transition name="fade">
        <div
          v-if="overlay"
          v-show="drawerOpen"
          class="absolute inset-0 bg-black/40 transition-opacity -z-10"
          @click="toggleDrawer(false, 'clickOutside')"
        ></div>
      </Transition>

      <Transition :name="`slide-${direction}`">
        <div
          :id="id"
          ref="drawerRef"
          v-if="drawerOpen"
          class="drawer fixed bg-base-200 text-base-content shadow-lg flex transform transition-transform duration-75 hover:select-none pointer-fine:select-none"
          :class="[drawerClass, drawerClasses]"
          :style="{ '--snap-point-height': snapPointHeight }"
          :data-drawer-direction="direction"
          role="dialog"
          :data-state="drawerOpen ? 'open' : 'closed'"
          tabindex="-1"
          @keydown.esc="toggleDrawer(false, 'close')"
          @pointerdown="onContainerPointerDown"
        >
          <div
            v-if="handle"
            ref="handleRef"
            class="shrink-0 bg-neutral rounded cursor-grab active:cursor-grabbing hover:bg-neutral/80"
            :class="[handlePositionClass]"
            @pointerdown="onHandlePointerDown"
          ></div>

          <slot name="content">
            <div class="w-full flex flex-col gap-4 p-4 overflow-y-auto">
              <!-- Header -->
              <div class="flex items-center justify-between">
                <slot name="header">
                  <h2 v-if="title" class="text-lg font-bold">
                    {{ title }}
                  </h2>
                </slot>
              </div>

              <div v-if="!!$slots.body" class="flex-1">
                <slot name="body"></slot>
              </div>

              <div
                v-if="!!$slots.footer"
                class="flex gap-1 md:justify-end justify-items-stretch py-4 shrink-0"
              >
                <slot name="footer" :toggleDrawer="toggleDrawer"></slot>
              </div>
            </div>
          </slot>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
[data-drawer-direction]::after {
  content: "";
  position: absolute;
  background-color: inherit;
}
[data-drawer-direction="top"]::after {
  top: inherit;
  bottom: 100%;
  height: 200%;
  left: 0;
  right: 0;
}
[data-drawer-direction="bottom"]::after {
  top: 100%;
  bottom: initial;
  height: 200%;
  left: 0;
  right: 0;
}
[data-drawer-direction="left"]::after {
  top: 0;
  bottom: 0;
  width: 200%;
  left: initial;
  right: 100%;
}
[data-drawer-direction="right"]::after {
  top: 0;
  bottom: 0;
  width: 200%;
  left: 100%;
  right: initial;
}
/* Overlay fade-in/out animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-leave-from,
.fade-enter-to {
  opacity: 1;
}

.slide-top-enter-active,
.slide-top-leave-active,
.slide-bottom-enter-active,
.slide-bottom-leave-active,
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

/* Vertical slide animation */
.slide-top-enter-from,
.slide-top-leave-to {
  transform: translateY(-100%);
}
.slide-top-leave-from,
.slide-top-enter-to {
  transform: translateY(0);
}
.slide-bottom-enter-from,
.slide-bottom-leave-to {
  transform: translateY(100%);
}
.slide-bottom-leave-from,
.slide-bottom-enter-to {
  transform: translateY(0);
}

/* Horizontal slide animation */

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.slide-left-leave-from,
.slide-left-enter-to {
  transform: translateX(0);
}
.slide-right-leave-from,
.slide-right-enter-to {
  transform: translateX(0);
}

[data-drawer-direction="top"],
[data-drawer-direction="bottom"] {
  transform: translate3d(0, var(--snap-point-height, 0), 0);
}

[data-drawer-direction="left"],
[data-drawer-direction="right"] {
  transform: translate3d(var(--snap-point-height, 0), 0, 0);
}
</style>
