<script setup lang="ts" generic="T extends readonly CommandPaletteGroup[]">
import type {
  CommandPaletteGroup,
  CommandPaletteItem,
  CommandPaletteProps,
  Slots,
} from "./types";

/**
 * TODO List:
 *
 * - Add select (model, and type based on multiple)
 */

const {
  groups = [],
  labelKey = "label",
  placeholder = "Type a command or search...",
  multiple = false,
  autofocus = true,
  disabled = false,

  loading = false,
  loadingIcon = "loading loading-spinner loading-sm",

  closeButton = false,
  closeIcon = "✕",

  icon = "🍺",
  selectedIcon = "✔️",
} = defineProps<CommandPaletteProps<T>>();

type ExtraSlots = "input" | "searchIcon";
const slots = defineSlots<Slots<T, ExtraSlots>>();

const searchTerm = defineModel<string>("searchTerm", {
  required: false,
  default: "",
});

const selectedItems = defineModel<
  Array<CommandPaletteItem> | CommandPaletteItem | undefined
>({
  required: false,
  default: undefined,
});

const searchInput = ref<HTMLInputElement | null>(null);

const handleItemClick = (item: CommandPaletteItem) => {
  item.onSelect?.(item);

  if (selectedItems.value === undefined) return;

  if (multiple) {
    if (Array.isArray(selectedItems.value)) {
      if (selectedItems.value.includes(item)) {
        selectedItems.value = selectedItems.value.filter((p) => p !== item);
        return;
      }

      selectedItems.value.push(item);
      return;
    }

    selectedItems.value = [item];
    return;
  }

  if (selectedItems.value != null) {
    selectedItems.value = undefined;
    return;
  }

  selectedItems.value = item;

  console.log("select", selectedItems.value);
};

const filterOptions = createFilterOptions<Readonly<CommandPaletteItem>>({
  stringify: (item) => {
    const label = item[labelKey]?.toString();

    return label || "";
  },
  returnType: "option",
});

const filteredGroups = computed(() => {
  const filtered = groups
    .map((group) => {
      const filteredItems = group.postFilter
        ? group.postFilter(searchTerm.value, group.items || [])
        : filterOptions((group.items || []) as Readonly<CommandPaletteItem>[], {
            searchTerm: searchTerm.value,
          });

      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items?.length || group.ignoreFilter);

  return filtered;
});

const getSlot = (
  slotName: keyof Slots<T, ExtraSlots>,
  item: CommandPaletteItem
) => {
  const itemSlotName = slotName.replace("item", item.slot || "") as keyof Slots<
    T,
    ExtraSlots
  >;

  if (slots[itemSlotName] && item.slot) {
    return item.slot as keyof Slots<T, ExtraSlots>;
  }

  return slotName;
};

onMounted(() => {
  if (autofocus) {
    searchInput.value?.focus();
  }
});
</script>

<template>
  <div
    class="rounded-md p-0 flex justify-center border border-neutral relative z-1"
  >
    <div class="flex flex-col min-h-0 min-w-0 divide-y divide-neutral flex-1">
      <div class="relative inline-flex items-center [&>input]:h-12">
        <span class="absolute inset-y-0 start-0 flex items-center ps-2.5">
          <slot name="searchIcon">
            <span
              :class="{
                [loadingIcon]: loading,
              }"
              >{{ icon }}
            </span>
          </slot>
        </span>

        <slot name="input">
          <input
            ref="searchInput"
            class="w-full rounded-md border-0 placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-highlighted bg-transparent ps-9"
            :placeholder="placeholder"
            v-model="searchTerm"
            :disabled="disabled"
          />
        </slot>

        <span
          v-if="closeButton"
          class="absolute inset-y-0 end-0 flex items-center pe-2.5"
        >
          <button type="button" class="btn btn-sm btn-ghost btn-square">
            {{ closeIcon }}
          </button>
        </span>
      </div>
      <div class="relative overflow-hidden flex flex-col">
        <div
          class="relative divide-y divide-neutral scroll-py-1 overflow-y-auto flex-1 focus:outline-none"
        >
          <div
            v-if="!filteredGroups.length"
            class="py-6 text-center text-sm text-muted"
          >
            No matching data
          </div>

          <TransitionGroup>
            <ul
              v-for="({ items, label }, groupIdx) in filteredGroups"
              :key="groupIdx"
              class="isolate menu menu-md w-full p-1"
              role="group"
            >
              <li v-if="label" class="menu-title text-xs font-semibold py-1.5!">
                {{ label }}
              </li>

              <li v-for="(item, itemIdx) in items || []" :key="itemIdx">
                <button
                  type="button"
                  class="group relative w-full flex items-center gap-1.5 text-sm select-none outline-none transition-colors"
                  :class="item.class"
                  @click="handleItemClick(item)"
                  :disabled="disabled || item.disabled"
                >
                  <slot :name="getSlot('item', item)" :item="item">
                    <span
                      v-if="
                        !!$slots.itemLeading ||
                        item.slot ||
                        item.icon ||
                        item.avatar
                      "
                      class="shrink-0 group-hover:not-group-data-disabled:text-neutral-content transition-colors"
                    >
                      <slot :name="getSlot('itemLeading', item)" :item="item">
                        <span
                          v-if="item.loading"
                          :class="{
                            [loadingIcon]: item.loading,
                          }"
                        ></span>
                        <AvatarImage
                          v-else-if="item.avatar"
                          v-bind="item.avatar"
                        />
                        <span v-else>{{ item.icon }}</span>
                      </slot>
                    </span>

                    <span class="truncate space-x-1 rtl:space-x-reverse">
                      <slot :name="getSlot('itemLabel', item)" :item="item">
                        <span
                          class="text-neutral-content opacity-50"
                          v-if="item.prefix"
                        >
                          {{ item.prefix }}
                        </span>

                        <span class="text-base-content">
                          {{ item[labelKey] }}
                        </span>
                        <span
                          class="text-neutral-content opacity-50"
                          v-if="item.suffix"
                        >
                          {{ item.suffix }}
                        </span>
                      </slot>
                    </span>

                    <span class="ms-auto inline-flex gap-1.5 items-center">
                      <slot :name="getSlot('itemTrailing', item)" :item="item">
                        <kbd
                          v-for="(kbd, kbdIdx) in item.kbds"
                          :key="kbdIdx"
                          class="kbd kbd-sm capitalize"
                        >
                          {{ kbd }}
                        </kbd>

                        <span
                          class="shrink-0 size-5"
                          v-if="
                            Array.isArray(selectedItems)
                              ? selectedItems.includes(item)
                              : selectedItems === item
                          "
                        >
                          {{ selectedIcon }}
                        </span>
                      </slot>
                    </span>
                  </slot>
                </button>
              </li>
            </ul>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>
