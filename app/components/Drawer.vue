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

const setStyle = (el: HTMLElement | null, styles: Record<string, string>) => {
  if (!el) return;
  Object.entries(styles).forEach(([k, v]) => {
    el.style.setProperty(k, v);
  });
};

const isVertical = computed(
  () => props.direction === "top" || props.direction === "bottom",
);

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

const toggleDrawer = (open: boolean, reason?: string) => {
  drawerOpen.value = open;

  nextTick(() => (open ? emit("shown", reason) : emit("hidden", reason)));
};

useDrag({
  vertical: isVertical.value,
  handleRef,
  containerRef: drawerRef,
  onDrag: ({ delta }) => {
    const directionMultiplier =
      props.direction === "bottom" || props.direction === "right" ? 1 : -1;

    const draggedDistance = delta * directionMultiplier;
    const isDraggingInDirection = draggedDistance > 0;

    const noCloseSnapPointsPreCondition =
      props.snapPoints && !props.dismissible && !isDraggingInDirection;

    if (noCloseSnapPointsPreCondition && !activeSnapPointIdx.value) return;

    const absDraggedDistance = Math.abs(draggedDistance);

    if (props.snapPoints) {
      onDragSnapPoints({ draggedDistance });
    }

    if (isDraggingInDirection && !props.snapPoints) {
      console.log("dragged distance", draggedDistance);
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
  },
  onRelease: ({ delta, velocity }) => {
    const directionMultiplier =
      props.direction === "bottom" || props.direction === "right" ? 1 : -1;

    if (props.snapPoints) {
      onReleaseSnapPoints({
        draggedDistance: delta * directionMultiplier,
        closeDrawer: () => toggleDrawer(false),
        velocity,
        dismissible: props.dismissible,
      });

      return;
    }

    if (velocity > props.closeThreshold) {
      toggleDrawer(false);
      return;
    }

    setStyle(drawerRef.value, { transform: "translate3d(0,0,0)" });
  },
});

// ============ Computed classes/styles ============
const baseClassMap = {
  top: "flex-col-reverse top-0 left-0 w-full h-auto rounded-b-box mb-24",
  bottom: "flex-col h-auto w-auto max-h-[96%] rounded-t-box mt-24",
  left: "flex-row-reverse top-0 left-0 h-full w-auto rounded-r-box",
  right: "flex-row top-0 right-0 h-full w-auto rounded-l-box",
};

const insetClassMap = {
  top: "rounded-t-box inset-x-4 top-4 overflow-hidden after:hidden",
  bottom: "rounded-b-box inset-x-4 bottom-4 overflow-hidden after:hidden",
  left: "rounded-l-box inset-y-4 left-4 after:hidden",
  right: "rounded-r-box inset-y-4 right-4 after:hidden",
};

const drawerClass = computed(() => {
  let base = baseClassMap[props.direction] ?? "";

  if (props.inset) base += " " + (insetClassMap[props.direction] ?? "");

  return base + (props.drawerClasses ? " " + props.drawerClasses : "");
});

const snapPointHeight = computed(() => {
  if (snapPointsOffset.value && snapPointsOffset.value.length > 0)
    return `${snapPointsOffset.value[0]}px`;

  return "0";
});

const handleClassMap = {
  top: "mb-4 w-12! h-1.5! mx-auto cursor-ns-resize",
  bottom: "mt-4 w-12! h-1.5! mx-auto cursor-ns-resize",
  left: "mr-4! h-12! w-1.5! mt-auto mb-auto cursor-ew-resize",
  right: "ml-4! h-12! w-1.5! mt-auto mb-auto cursor-ew-resize",
};
const handlePositionClass = computed(
  () => handleClassMap[props.direction] ?? "",
);

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
          v-show="overlay && drawerOpen"
          class="absolute inset-0 bg-black/40 transition-opacity -z-10"
          @click="toggleDrawer(false, 'clickOutside')"
        ></div>
      </Transition>

      <Transition :name="`slide-${direction}`">
        <div
          :id="id"
          ref="drawerRef"
          v-show="drawerOpen"
          class="drawer fixed bg-base-200 text-base-content shadow-lg flex transform transition-transform duration-75 hover:select-none pointer-fine:select-none"
          :class="drawerClass"
          :style="{ '--snap-point-height': snapPointHeight }"
          :data-drawer-direction="direction"
          role="dialog"
          :data-state="drawerOpen ? 'open' : 'closed'"
          tabindex="-1"
          @keydown.esc="toggleDrawer(false, 'close')"
        >
          <div
            v-if="handle"
            ref="handleRef"
            class="shrink-0 bg-neutral rounded cursor-grab active:cursor-grabbing hover:bg-neutral/80"
            :class="handlePositionClass"
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
