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

  items?: MenuItem[];
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
  props.autoClose,
);

const handleToggleDropdown = () => {
  isOpen.value = !isOpen.value;
  console.log("toggle", isOpen.value);
  if (!isOpen.value) {
    buttonRef.value?.blur();

    emit("close");
  }
};

const [DefineMenuItem, ReuseMenuItem] = useReusableTemplate<{
  menuItem: MenuItem;
}>();
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
    <DefineMenuItem v-slot="{ menuItem }">
      <template v-if="menuItem">
        <MenuItem
          v-bind="menuItem"
          :class="[
            { 'menu-dropdown-toggle menu-dropdown-show': menuItem?.children },
          ]"
        >
          <slot v-if="menuItem.slot" :name="menuItem.slot"></slot>

          <template #children v-if="menuItem.children">
            <ul class="menu-dropdown menu-dropdown-show">
              <ReuseMenuItem
                v-for="(subItem, idx) in menuItem.children.flat()"
                :key="`dropdown-item-${idx}`"
                :menuItem="subItem"
              />
            </ul>
          </template>
        </MenuItem>
      </template>
    </DefineMenuItem>

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
              <template
                v-for="(item, idx) in itemOrGroup"
                :key="`dropdown-item-${idx}`"
              >
                <ReuseMenuItem :menuItem="item" />
              </template>

              <div
                v-if="idx != (items || []).length - 1"
                class="divider my-0"
              ></div>
            </div>

            <template v-else :key="`dropdown-item-wrapper-${idx}`">
              <ReuseMenuItem :menuItem="itemOrGroup" />
            </template>
          </template>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke,
    opacity, box-shadow, transform, filter, backdrop-filter !important;
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
