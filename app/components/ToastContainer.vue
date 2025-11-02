<template>
  <div class="toast toast-bottom toast-end z-1000!">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['alert', getSeverityClass(toast.type), toast.options?.class]"
    >
      <span
        v-if="toast.type === 'loading'"
        class="loading loading-spinner loading-sm shrink-0"
      ></span>
      <span v-else-if="toast.options?.icon" class="shrink-0">{{
        toast.options.icon
      }}</span>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="size-6 fill-none shrink-0 stroke-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="getIconPath(toast.type)"
        />
      </svg>

      <span>{{ toast.message }}</span>

      <button
        type="button"
        class="btn btn-sm btn-ghost btn-square ml-4"
        @click="remove(toast.id)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="fill-current size-3"
        >
          <path
            d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToasts } from "~/composables/useToasts";

const { toasts, remove } = useToasts();

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case "success":
      return "alert-success";
    case "warning":
      return "alert-warning";
    case "error":
      return "alert-error";
    default:
      return "";
  }
};

const getIconPath = (severity: string) => {
  switch (severity) {
    case "success":
      return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
    case "warning":
      return "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
    case "error":
      return "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";
    case "info":
      return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    default:
      return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  }
};

watch(
  () => toasts.value,
  (newToasts) => {
    toasts.value = newToasts;
  },
  { deep: true }
);
</script>
