<script setup lang="ts">
import { computed } from "vue";

type Props = {
  label?: string;
  value?: string | number;
  type?: "checkbox" | "radio";
  size?: "xs" | "sm" | "md" | "lg";
};

const props = withDefaults(defineProps<Props>(), {
  label: "",
  type: "checkbox",
  size: "md",
});

const modelValue = defineModel<string | number | null | undefined>({
  required: true,
});

const computedTileClass = computed(() => {
  const isChecked = Array.isArray(modelValue.value)
    ? modelValue.value.includes(props.value || "")
    : modelValue.value === props.value;

  const sizes = {
    xs: "min-w-12 min-h-12 text-xs",
    sm: "min-w-14 min-h-14 text-sm",
    md: "min-w-20 min-h-20 text-sm",
    lg: "min-w-24 min-h-24 text-base",
  };
  return [
    sizes[props.size],
    {
      "text-primary border border-primary": isChecked,
      "text-neutral-content border border-base-content/20": !isChecked,
    },
  ];
});
</script>

<template>
  <label class="position-relative">
    <input
      :type="type"
      class="checkbox-input hidden"
      v-model="modelValue"
      :value="value || label"
      v-bind="$attrs"
    />
    <span
      class="flex flex-col justify-center items-center relative rounded-md transition-all cursor-pointer checkbox-tile gap-1"
      :class="computedTileClass"
    >
      <slot name="icon"></slot>

      <span class="text-center transition-all">
        <slot>{{ label || value }}</slot>
      </span>
    </span>
  </label>
</template>

<style scoped>
.checkbox-input:checked + .checkbox-tile:before {
  transform: scale(1);
  opacity: 1;
  background-color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.checkbox-input:focus + .checkbox-tile {
  border-color: var(--color-primary);
}
.checkbox-input:focus + .checkbox-tile:before {
  transform: scale(1);
  opacity: 1;
}

.checkbox-tile:before {
  content: "";
  position: absolute;
  display: block;
  width: 0.75rem;
  height: 0.75rem;
  border: 1px solid;
  border-radius: 50%;
  top: 0.25rem;
  left: 0.25rem;
  padding: 0.5rem;
  opacity: 0;
  transform: scale(0);
  transition: 0.25s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' class='w-2' fill='%23FFFFFF' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='none'%3E%3C/rect%3E%3Cpolyline points='216 72.005 104 184 48 128.005' fill='none' stroke='%23FFFFFF' stroke-linecap='round' stroke-linejoin='round' stroke-width='32'%3E%3C/polyline%3E%3C/svg%3E");
  background-size: 12px;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.checkbox-tile:hover:before {
  transform: scale(1);
  opacity: 1;
}
</style>
