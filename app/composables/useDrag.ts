interface UseDragOptions {
  vertical?: boolean;
  handleRef?: Ref<HTMLElement | null>;
  containerRef?: Ref<HTMLElement | null>;
  onDrag?: ({ delta, velocity }: { delta: number; velocity: number }) => void;
  onRelease?: ({
    delta,
    velocity,
  }: {
    delta: number;
    velocity: number;
  }) => void;
  disabled?: boolean;
}

export function useDrag(options: UseDragOptions) {
  if (import.meta.server)
    return {
      isDragging: ref(false),
      startDrag: () => {},
      velocity: ref(0),
    };

  const {
    vertical = true,
    handleRef,
    containerRef,
    onDrag,
    onRelease,
    disabled = false,
  } = options;

  const isDragging = ref(false);
  const startPos = ref(0);
  const lastPos = ref(0);
  const dragStartTime = ref<number>(0);

  // pixels per ms
  const velocity = ref(0);

  const getCoord = (ev: PointerEvent | TouchEvent) =>
    "touches" in ev
      ? vertical
        ? (ev.touches[0]?.clientY ?? 0)
        : (ev.touches[0]?.clientX ?? 0)
      : vertical
        ? ev.clientY
        : ev.clientX;

  const startDrag = (ev: PointerEvent) => {
    console.info("Start drag", { ev, disabled });
    if (disabled) return;

    isDragging.value = true;
    startPos.value = getCoord(ev);
    lastPos.value = startPos.value;
    dragStartTime.value = performance.now();

    try {
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
    } catch {}

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (ev: PointerEvent) => {
    if (!isDragging.value) return;

    const currentPos = getCoord(ev);
    const delta = startPos.value - currentPos;
    const timeDelta = performance.now() - dragStartTime.value;

    velocity.value = Math.abs(delta) / Math.max(timeDelta, 1);

    lastPos.value = currentPos;
    dragStartTime.value = performance.now();

    console.info("Drag at", delta, "velocity", velocity.value);
    if (onDrag) onDrag({ delta, velocity: velocity.value });
  };

  const onPointerUp = (ev: PointerEvent) => {
    if (!isDragging.value) return;
    isDragging.value = false;

    const totalDelta = lastPos.value - startPos.value;
    if (onRelease) onRelease({ delta: totalDelta, velocity: velocity.value });

    try {
      (ev.target as Element).releasePointerCapture(ev.pointerId);
    } catch {}

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  const bindHandle = () => {
    if (!handleRef?.value) return;
    handleRef.value.addEventListener("pointerdown", startDrag);
  };

  const bindContainer = () => {
    if (!containerRef?.value) return;
    containerRef.value.addEventListener("pointerdown", startDrag);
  };

  onMounted(() => {
    console.log("USE DRAG", containerRef?.value);
    bindHandle();
    bindContainer();
  });

  onBeforeUnmount(() => {
    if (handleRef?.value)
      handleRef.value.removeEventListener("pointerdown", startDrag);
    if (containerRef?.value)
      containerRef.value.removeEventListener("pointerdown", startDrag);

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  });

  return {
    isDragging,
    startDrag,
    velocity,
  };
}
