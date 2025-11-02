<script setup lang="ts">
import type { MenuItemProps } from "./MenuItem.vue";

export type MenuItem = {
  /**
   * Unique identifier for the item.
   * @default 'label'
   */
  type?: "link" | "label" | "divider" | "checkbox";

  class?: string;
  checked?: boolean;
  onClick?: () => void;

  onUpdateChecked?: (value: boolean) => void;

  /**
   * Slot name for the item.
   */
  slot?: string;

  children?: MenuItem[] | MenuItem[][];
} & MenuItemProps;

type Props = {
  btnClass?: string;
  menuClass?: string;
  /** Opens dropdown on hover */
  hover?: boolean;
  /**
   * Modes for auto-closing the dropdown.
   * - "always" - Close on any click (inside or outside).
   * - "inside" - Close only when clicked inside the target element.
   * - "outside" - Close only when clicked outside the target element.
   * - "none" - Never auto-close.
   */
  autoClose?: AutoCloseMode;
  /**
   * Direction of dropdown menu
   * @default 'bottom'
   */
  direction?: "top" | "bottom" | "left" | "right";
  alignMenu?: "start" | "end";

  menuSize?: "xs" | "sm" | "md" | "lg";

  /**
   * TODO: implement this
   */
  items?: MenuItem[] | MenuItem[][];
};

const props = withDefaults(defineProps<Props>(), {
  btnClass: "btn",
  menuClass: "w-52",
  hover: false,
  autoClose: "always",
  direction: "bottom",
  alignMenu: "start",
  menuSize: "md",
});

const emit = defineEmits<{
  close: [];
}>();

const dropdownRef = ref<HTMLDivElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);

const isOpen = defineModel<boolean>("open", {
  type: Boolean,
  default: false,
});

useClickOutside(
  dropdownRef,
  (event) => {
    const target = event.target as Node;

    if (!dropdownRef.value || !buttonRef.value) return;

    if (!dropdownRef.value.contains(target) && !isOpen.value) return;

    isOpen.value = false;
    // console.log("click outside");
    // emit('close');

    // buttonRef.value?.focus();
    // buttonRef.value.blur();

    // dropdownRef.value.blur();
  },
  props.autoClose
);

const handleToggleDropdown = () => {
  isOpen.value = !isOpen.value;
  console.log("toggle", isOpen.value);
  if (!isOpen.value) {
    buttonRef.value?.blur();

    emit("close");
  }
};

// TODO: use reuseableComponent for the items
</script>

<template>
  <div
    ref="dropdownRef"
    class="dropdown"
    :class="{
      'dropdown-hover': hover,
      'dropdown-open': isOpen,
      'dropdown-end': alignMenu === 'end',
    }"
  >
    <div
      ref="buttonRef"
      tabindex="0"
      role="button"
      :class="btnClass"
      v-bind="$attrs"
      @click.stop="handleToggleDropdown"
    >
      <slot>Click</slot>
    </div>
    <Transition name="dropdown" appear>
      <div
        tabindex="0"
        class="dropdown-content menu bg-base-300 rounded-box z-10 p-2 shadow-sm"
        :class="[
          menuClass,
          {
            'menu-xs': menuSize === 'xs',
            'menu-sm': menuSize === 'sm',
            'menu-md': menuSize === 'md',
            'menu-lg': menuSize === 'lg',
          },
        ]"
      >
        <slot name="items">
          <template v-for="(itemOrGroup, idx) in items">
            <div
              :key="`dropdown-group-${idx}`"
              class="isolate"
              v-if="Array.isArray(itemOrGroup)"
            >
              <MenuItem
                v-for="(item, idx) in itemOrGroup"
                :key="`dropdown-item-${idx}`"
                :disabled="item.disabled"
                :class="item.class"
                :icon="item.icon"
                :avatar="item.avatar"
                :active="item.checked || item.active"
                :label="item.label"
                :to="item.to"
                :color="item.color"
                @click="item.onClick"
              >
                <slot v-if="item.slot" :name="item.slot"></slot>

                <template #children v-if="item.children">
                  <ul class="menu-dropdown menu-dropdown-show">
                    <MenuItem
                      v-for="(subItem, idx) in item.children.flat()"
                      :key="`dropdown-item-${idx}`"
                      :disabled="subItem.disabled"
                      :class="subItem.class"
                      :icon="subItem.icon"
                      :avatar="subItem.avatar"
                      :active="subItem.checked || subItem.active"
                      :label="subItem.label"
                      :to="subItem.to"
                      :color="item.color"
                      @click="subItem.onClick"
                    >
                      <slot v-if="subItem.slot" :name="subItem.slot"></slot>
                    </MenuItem>
                  </ul>
                </template>
              </MenuItem>

              <div
                v-if="idx != (items || []).length - 1"
                class="divider my-0"
              ></div>
            </div>

            <MenuItem
              v-else
              :key="`dropdown-item-${idx}`"
              :disabled="itemOrGroup.disabled"
              :class="[
                itemOrGroup.class,
                {
                  'menu-dropdown-toggle menu-dropdown-show':
                    itemOrGroup.children,
                },
              ]"
              :icon="itemOrGroup.icon"
              :avatar="itemOrGroup.avatar"
              :active="itemOrGroup.checked || itemOrGroup.active"
              :label="itemOrGroup.label"
              :to="itemOrGroup.to"
              :color="itemOrGroup.color"
              @click="itemOrGroup.onClick"
            >
              <slot v-if="itemOrGroup.slot" :name="itemOrGroup.slot"></slot>

              <template #children v-if="itemOrGroup.children">
                <ul class="menu-dropdown menu-dropdown-show">
                  <MenuItem
                    v-for="(item, idx) in itemOrGroup.children.flat()"
                    :key="`dropdown-item-${idx}`"
                    :disabled="item.disabled"
                    :class="item.class"
                    :icon="item.icon"
                    :avatar="item.avatar"
                    :active="item.checked || item.active"
                    :label="item.label"
                    :to="item.to"
                    :color="item.color"
                    @click="item.onClick"
                  >
                    <slot v-if="item.slot" :name="item.slot"></slot>
                  </MenuItem>
                </ul>
              </template>
            </MenuItem>
          </template>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter !important;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1) !important;
  transition-duration: 0.2s !important;
}
.dropdown-enter-from,
.dropdown-leave-to {
  visibility: hidden;
  opacity: 0 !important;

  --tw-scale-x: 0.95 !important;
  --tw-scale-y: 0.95 !important;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important;
}
.dropdown-leave-from,
.dropdown-enter-to {
  opacity: 1 !important;
  visibility: visible;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important;
}
</style>
