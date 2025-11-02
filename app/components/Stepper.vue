<script setup lang="ts">
type Props = {
  steps?: string[];
  direction?: "vertical" | "horizontal";
};

withDefaults(defineProps<Props>(), {
  steps: () => [],
  direction: "horizontal",
});

const modelValue = defineModel<number>({
  required: false,
  default: 0,
});

const changeStep = (stepIndex: number) => {
  modelValue.value = stepIndex;
};

defineExpose({
  currentStep: modelValue,
});
</script>

<template>
  <div class="w-full">
    <ul
      class="steps w-full"
      :class="[
        direction === 'horizontal' ? 'steps-horizontal' : 'steps-vertical',
      ]"
    >
      <li
        v-for="(step, stepIndex) in steps"
        :key="stepIndex"
        class="step"
        :class="{ 'step-primary': modelValue >= stepIndex }"
        @click="changeStep(stepIndex)"
      >
        <button type="button" @click="changeStep(stepIndex)">
          {{ step }}
        </button>
      </li>
    </ul>

    <div class="carousel w-full px-1">
      <template
        v-for="(step, stepIndex) in steps"
        :key="`step-panel-${stepIndex}`"
      >
        <div
          v-show="modelValue === stepIndex"
          :id="`step-${step}`"
          class="carousel-item w-full"
        >
          <slot :name="`step-${step.toLowerCase()}`">Step "{{ step }}"</slot>
        </div>
      </template>
    </div>
  </div>
</template>
