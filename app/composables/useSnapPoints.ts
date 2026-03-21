type Direction = "left" | "right" | "top" | "bottom";
type useSnapPointsProps = {
  activeSnapPoint: Ref<number | string | null | undefined>;
  snapPoints: Ref<(number | string)[] | undefined>;
  drawerRef: Ref<HTMLElement | null>;
  onSnapPointChange: (
    activeSnapPointIndex: number,
    snapPointsOffset: number[],
  ) => void;
  direction: Ref<Direction>;
};

export const useSnapPoints = ({
  activeSnapPoint,
  snapPoints,
  drawerRef,
  onSnapPointChange,
  direction,
}: useSnapPointsProps) => {
  const isVertical = (direction: Direction) =>
    direction === "top" || direction === "bottom";

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

  const windowSize = ref(
    typeof window !== "undefined"
      ? {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        }
      : undefined,
  );

  const isLastSnapPoint = computed(
    () =>
      (snapPoints.value &&
        activeSnapPoint.value ===
          snapPoints.value[snapPoints.value.length - 1]) ??
      null,
  );

  const activeSnapPointIdx = computed(() => {
    return (
      snapPoints.value?.findIndex((sp) => sp === activeSnapPoint.value) ?? null
    );
  });

  const snapPointsOffset = computed(
    () =>
      snapPoints.value?.map((snapPoint) => {
        const isPx = typeof snapPoint === "string";
        let snapPointAsNum = 0;

        if (isPx) snapPointAsNum = Number.parseInt(snapPoint, 10);

        if (isVertical(direction.value)) {
          const height = isPx
            ? snapPointAsNum
            : windowSize.value
              ? snapPoint * windowSize.value.innerHeight
              : 0;

          // console.log("snap", snapPoint, "|", height, "|", windowSize.value);
          if (windowSize.value) {
            return direction.value === "bottom"
              ? windowSize.value.innerHeight - height
              : -windowSize.value.innerHeight + height;
          }

          return height;
        }

        const width = isPx
          ? snapPointAsNum
          : windowSize.value
            ? snapPoint * windowSize.value.innerWidth
            : 0;

        if (windowSize.value)
          return direction.value === "right"
            ? windowSize.value.innerWidth - width
            : -windowSize.value.innerWidth + width;

        return width;
      }) ?? [],
  );

  const activeSnapPointOffset = computed(() =>
    activeSnapPointIdx.value != null
      ? snapPointsOffset.value?.[activeSnapPointIdx.value]
      : null,
  );

  const snapToPoint = (dim: number) => {
    const newSnapPointIndex =
      snapPointsOffset.value?.findIndex(
        (snapPointDim) => snapPointDim === dim,
      ) ?? null;

    nextTick(() => {
      onSnapPointChange(newSnapPointIndex, snapPointsOffset.value);
      setStyle(drawerRef.value, {
        transform: isVertical(direction.value)
          ? `translate3d(0, ${dim}px, 0)`
          : `translate3d(${dim}px, 0, 0)`,
      });
    });

    activeSnapPoint.value =
      newSnapPointIndex !== null
        ? (snapPoints.value?.[newSnapPointIndex] ?? null)
        : null;
  };

  watch(
    [activeSnapPoint, snapPointsOffset, snapPoints],
    () => {
      if (activeSnapPoint.value == null) return;

      const newIdx =
        snapPoints.value?.findIndex(
          (snapPoint) => snapPoint === activeSnapPoint.value,
        ) ?? -1;

      if (
        snapPointsOffset.value &&
        newIdx !== -1 &&
        typeof snapPointsOffset.value[newIdx] === "number"
      ) {
        snapToPoint(snapPointsOffset.value[newIdx]);
      }
    },
    {
      immediate: true,
    },
  );

  const onDrag = ({ draggedDistance }: { draggedDistance: number }) => {
    if (activeSnapPointOffset.value == null) return;

    const newValue =
      direction.value === "bottom" || direction.value === "right"
        ? activeSnapPointOffset.value - draggedDistance
        : activeSnapPointOffset.value + draggedDistance;

    const lastSnapOffset =
      snapPointsOffset.value[snapPointsOffset.value.length - 1] || 0;

    if (
      (direction.value === "bottom" || direction.value === "right") &&
      newValue < lastSnapOffset
    )
      return;

    if (
      (direction.value === "top" || direction.value === "left") &&
      newValue > lastSnapOffset
    )
      return;

    setStyle(drawerRef.value, {
      transform: isVertical(direction.value)
        ? `translate3d(0, ${newValue}px, 0)`
        : `translate3d(${newValue}px, 0, 0)`,
    });
  };

  const onReleaseSnapPoints = ({
    draggedDistance,
    closeDrawer,
    velocity,
    dismissible,
  }: {
    draggedDistance: number;
    closeDrawer: () => void;
    velocity: number;
    dismissible: boolean;
  }) => {
    const currentPosition =
      direction.value === "bottom" || direction.value === "right"
        ? (activeSnapPointOffset.value ?? 0) - draggedDistance
        : (activeSnapPointOffset.value ?? 0) + draggedDistance;
    const isFirst = activeSnapPointIdx.value === 0;
    const hasDraggedUp = draggedDistance > 0;

    if (velocity > 2 && !hasDraggedUp) {
      if (dismissible) closeDrawer();
      else snapToPoint(snapPointsOffset.value[0] || 0); // snap to initial point
      return;
    }

    if (velocity > 2 && hasDraggedUp && snapPointsOffset && snapPoints.value) {
      snapToPoint(
        snapPointsOffset.value[snapPoints.value.length - 1] as number,
      );
      return;
    }

    // Find the closest snap point to the current position
    const closestSnapPoint = snapPointsOffset.value?.reduce((prev, curr) => {
      if (typeof prev !== "number" || typeof curr !== "number") return prev;

      return Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition)
        ? curr
        : prev;
    });

    const velocityThreshold = 0.4;

    const dim = isVertical(direction.value)
      ? window.innerHeight
      : window.innerWidth;
    if (
      velocity > velocityThreshold &&
      Math.abs(draggedDistance) < dim * velocityThreshold
    ) {
      const dragDirection = hasDraggedUp ? 1 : -1;

      if (dragDirection > 0 && isLastSnapPoint) {
        snapToPoint(
          snapPointsOffset.value[(snapPoints.value?.length ?? 0) - 1] || 0,
        );
        return;
      }

      if (isFirst && dragDirection < 0 && dismissible) closeDrawer();

      if (activeSnapPointIdx.value == null) return;

      snapToPoint(
        snapPointsOffset.value[activeSnapPointIdx.value + dragDirection] || 0,
      );
      return;
    }

    snapToPoint(closestSnapPoint);
  };

  const onResize = () => {
    windowSize.value = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
  };

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", onResize);
    }
  });

  return {
    isLastSnapPoint,
    activeSnapPointIdx,
    onReleaseSnapPoints,
    onDrag,
    snapPointsOffset,
  };
};
