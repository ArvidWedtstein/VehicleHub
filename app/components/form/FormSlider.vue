<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";

/** TODO: make work */
type Props = {
  min?: number;
  max?: number;

  step?: number;

  /** Toggle when label is visible. Default is auto */
  valueLabelDisplay?: "auto" | "on" | "off";

  orientation?: "horizontal" | "vertical";
  /** Prevents overlapping of handles */
  disableSwap?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  valueLabelDisplay: "auto",
  orientation: "horizontal",
  disableSwap: false,
});

const emit = defineEmits<{
  change: [
    event: MouseEvent | TouchEvent,
    value: number,
    activeHandleIndex: number
  ];
}>();

const model = defineModel<number | Array<number>>({
  default: 0,
});

const sliderRef = ref<HTMLDivElement>();

const ranges = computed(() => {
  return (Array.isArray(model.value) ? model.value : [model.value]).map(
    (val) => {
      return ((val - props.min) / (props.max - props.min)) * 100;
    }
  );
});

const rangeWidth = computed(() =>
  ranges.value.length > 1
    ? Math.max(...ranges.value) - Math.min(...ranges.value)
    : (ranges.value[0] || 0) - 0
);

const activeHandleIndex = ref<number | null>(null);

const calculateValueFromPosition = (clientX: number) => {
  const slider = sliderRef.value;
  if (!slider) return 0;

  const rect = slider.getBoundingClientRect();
  const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)); // Clamp between 0 and 1
  return Math.round(props.min + position * (props.max - props.min));
};

// Event handlers
const startDrag = (handleIndex: number) => {
  activeHandleIndex.value = handleIndex;

  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchmove", onDrag);
  window.addEventListener("touchend", endDrag);
};

const onDrag = (event: MouseEvent | TouchEvent) => {
  const activeIndex = activeHandleIndex.value;

  if (activeIndex === null) return;

  const clientX =
    event instanceof MouseEvent
      ? event.clientX
      : event.touches[0]?.clientX || 0;

  const newValue = Math.min(
    Math.max(calculateValueFromPosition(clientX), props.min),
    props.max
  );

  if (!Array.isArray(model.value)) {
    model.value = newValue;
    emit("change", event, newValue, activeIndex);

    return;
  }

  if (props.disableSwap) {
    const prevValue = model.value[activeIndex - 1] ?? props.min;
    const nextValue = model.value[activeIndex + 1] ?? props.max;

    const clampedValue = Math.min(Math.max(newValue, prevValue), nextValue);

    model.value[activeIndex] = clampedValue;

    emit("change", event, clampedValue, activeIndex);
    return;
  }

  model.value[activeIndex] = newValue;

  if (
    activeIndex > 0 &&
    model.value[activeIndex] < (model.value[activeIndex - 1] || 0)
  ) {
    // Swap with prev handle
    [model.value[activeIndex - 1], model.value[activeIndex]] = [
      model.value[activeIndex],
      model.value[activeIndex - 1] || 0,
    ];
    activeHandleIndex.value = activeIndex - 1;
  } else if (
    activeIndex < model.value.length - 1 &&
    model.value[activeIndex] > (model.value[activeIndex + 1] || 0)
  ) {
    // Swap with next handle
    [model.value[activeIndex], model.value[activeIndex + 1]] = [
      model.value[activeIndex + 1] || 0,
      model.value[activeIndex] || 0,
    ];
    activeHandleIndex.value = activeIndex + 1;
  }

  emit("change", event, newValue, activeHandleIndex.value ?? activeIndex);
};

const endDrag = () => {
  activeHandleIndex.value = null;

  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", endDrag);
  window.removeEventListener("touchmove", onDrag);
  window.removeEventListener("touchend", endDrag);
};

const handleTrackClick = (event: MouseEvent) => {
  let clickValue = calculateValueFromPosition(event.clientX);

  let closestIndex = 0;
  let minDistance = Infinity;

  if (!Array.isArray(model.value)) {
    model.value = Math.min(Math.max(clickValue, props.min), props.max);
    emit("change", event, clickValue, closestIndex);

    return;
  }

  model.value.forEach((thumbValue, index) => {
    const distance = Math.abs(clickValue - thumbValue);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  if (closestIndex > 0) {
    clickValue = Math.max(clickValue, (model.value[closestIndex - 1] || 0) + 1);
  }
  if (closestIndex < model.value.length - 1) {
    clickValue = Math.min(clickValue, (model.value[closestIndex + 1] || 0) - 1);
  }

  model.value[closestIndex] = clickValue;

  emit("change", event, clickValue, closestIndex);
};

onUnmounted(() => {
  endDrag();
});
</script>

<template>
  <span class="range-slider" ref="sliderRef" @mousedown="handleTrackClick">
    <span class="slider-track"></span>

    <span
      class="slider-range"
      :style="{
        left: (Array.isArray(model) ? Math.min(...ranges) : 0) + '%',
        width: rangeWidth + '%',
      }"
    ></span>

    <span
      v-for="(thumb, thumbIndex) in Array.isArray(model) ? model : [model]"
      :key="thumbIndex"
      class="slider-thumb tooltip tooltip-top"
      :class="{
        'tooltip-open':
          (activeHandleIndex === thumbIndex && valueLabelDisplay === 'auto') ||
          valueLabelDisplay === 'on',
      }"
      :style="{
        left: ranges[thumbIndex] + '%',
      }"
      @mousedown.prevent="startDrag(thumbIndex)"
      @touchstart.prevent="startDrag(thumbIndex)"
      :data-tip="thumb"
    >
      <input
        type="range"
        class="border-0 overflow-hidden -m-px p-0 whitespace-nowrap absolute w-full h-full"
        style="clip: rect(0px, 0px, 0px, 0px)"
        v-bind="$attrs"
        :value="thumb"
        :min="min"
        :max="max"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="thumb"
        :aria-orientation="orientation"
      />
    </span>
  </span>
</template>

<style scoped>
.range-slider {
  width: 100%;
  position: relative;
  height: 1.5rem;
  border-radius: var(--rounded-box, 1rem);
  display: flex;
  align-items: center;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 0.5rem;
  background-color: color-mix(in oklab, currentColor 10%, #0000);
  border-radius: var(--rounded-box, 1rem);
}

.slider-range {
  position: absolute;
  height: 0.75rem;
  background: var(--color-primary);
  border-radius: var(--rounded-box, 1rem);
}

.slider-thumb {
  position: absolute;
  height: var(--range-thumb-size, 1.5rem);
  width: var(--range-thumb-size, 1.5rem);
  border-radius: calc(var(--radius-selector) + var(--range-p, 0.5rem));
  border-style: none;
  --tw-bg-opacity: 1;
  background-color: var(--color-base-200);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--range-progress, "currentColor");
  box-shadow: 0 0 0 3px var(--color-base-content) inset;
  z-index: 2;
  cursor: pointer;
}
</style>
