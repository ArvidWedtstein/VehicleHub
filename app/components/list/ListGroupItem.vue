<script setup lang="ts">
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";

type Props = {
  imageUrl?: string;
  imageClass?: string;

  title?: string | null;
  subtitle?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  as?: "a" | "button" | string | Component;
  noHoverEffect?: boolean;
  to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
};

const props = withDefaults(defineProps<Props>(), {
  title: "",
  size: "md",
  as: "a",
  noHoverEffect: false,
});

const listGroupSize = inject("listGroupSize", props.size) ?? props.size;

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  emit("click", event);
};
</script>

<template>
  <li>
    <component
      class="flex items-center"
      :class="{
        'hover:bg-transparent': noHoverEffect,
        'px-2 py-1 gap-x-1': listGroupSize === 'xs',
        'px-2.5 py-2 gap-x-2': listGroupSize === 'sm',
        'px-3 py-2 gap-x-2 md:gap-x-4': listGroupSize === 'md',
        'px-4 py-3 gap-x-2 md:gap-x-4': listGroupSize === 'lg',
        'px-5 py-6 gap-x-3 md:gap-x-4': listGroupSize === 'xl',
      }"
      v-bind="$attrs"
      :is="as"
      @click="handleClick"
    >
      <slot>
        <slot
          name="icon"
          :sizeClass="{
            'size-8': listGroupSize === 'xs',
            'size-10': listGroupSize === 'sm',
            'size-10 md:size-12': listGroupSize === 'md',
            'size-12 md:size-14': listGroupSize === 'lg',
            'size-14 md:size-16': listGroupSize === 'xl',
          }"
        >
          <img
            v-show="!!imageUrl"
            alt=""
            :src="imageUrl"
            class="flex-none rounded-full bg-base-100 object-cover"
            :class="[
              imageClass,
              {
                'size-8': listGroupSize === 'xs',
                'size-10': listGroupSize === 'sm',
                'size-10 md:size-12': listGroupSize === 'md',
                'size-12': listGroupSize === 'lg',
                'size-14': listGroupSize === 'xl',
              },
            ]"
          />
        </slot>

        <div class="min-w-0 grow flex flex-col gap-1 justify-center">
          <p
            class="text-base leading-6 font-semibold text-base-content flex items-center gap-1"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </p>

          <div class="text-gray-400 leading-5 text-sm flex gap-1 items-center">
            <slot name="subtitle">
              <p
                v-if="subtitle"
                class="overflow-hidden text-ellipsis whitespace-nowrap text-xs"
                :class="{
                  'mt-1':
                    listGroupSize === 'md' ||
                    listGroupSize === 'lg' ||
                    listGroupSize === 'xl',
                }"
              >
                {{ subtitle }}
              </p>
            </slot>
          </div>
        </div>

        <slot
          name="endIcon"
          :sizeClass="{
            'size-8': listGroupSize === 'xs',
            'size-10': listGroupSize === 'sm',
            'size-10 md:size-12': listGroupSize === 'md',
            'size-6': listGroupSize === 'lg',
            'size-14 md:size-16': listGroupSize === 'xl',
          }"
        ></slot>
      </slot>
    </component>
  </li>
</template>
