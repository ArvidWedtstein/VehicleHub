<script
  lang="ts"
  setup
  generic="
    Value,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false
  "
>
type AutocompleteValue<Value, Multiple, DisableClearable> =
  Multiple extends true
    ? Array<Value | never>
    : DisableClearable extends true
    ? NonNullable<Value | never>
    : Value | null | never;

type AutocompleteProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined
> = {
  label?: string;
  modelValue?: AutocompleteValue<Value, Multiple, DisableClearable>;
  options: ReadonlyArray<Value>;
  debounceDelay?: number;
  multiple?: Multiple;
  disableClearable?: DisableClearable;
  closeOnSelect?: boolean;
  clearOnBlur?: boolean;
  readonly?: boolean;
  wrapperClass?: string;
  getOptionLabel?: (option: Value) => string;
  getOptionValue?: (option: Value) => string | number | boolean;
  isOptionEqualToValue?: (option: Value, value: Value) => boolean;
};

const props = withDefaults(
  defineProps<AutocompleteProps<Value, Multiple, DisableClearable>>(),
  {
    isOptionEqualToValue: (option: Value, value: Value) => option === value,
    getOptionLabel: (option: Value | string) => {
      if (typeof option === "object" && option !== null && "label" in option) {
        return option.label as string;
      }

      return typeof option !== "string" ? JSON.stringify(option) : option;
    },
    getOptionValue: (option: Value | string) => {
      if (typeof option === "object" && option !== null && "value" in option) {
        return option.value as string;
      }

      if (typeof option === "object" && option !== null && "id" in option) {
        return option.id as number;
      }

      return JSON.stringify(option);
    },
    readonly: false,
    closeOnSelect: true,
    clearOnBlur: false,
  }
);

const emit = defineEmits<{
  select: [option: Value];
  "update:modelValue": [value: Value];
}>();

const inputValue = defineModel<string>("search", {
  required: false,
  default: "",
});

const selectedIndex = ref(-1);
const isDropdownOpen = ref(false);

const inputValueIsSelectedValue = computed(
  () =>
    !props.multiple &&
    !Array.isArray(props.modelValue) &&
    props.modelValue != null &&
    inputValue.value === props.getOptionLabel(props.modelValue as Value)
);

const filterOptions = createFilterOptions<Value>({
  stringify: props.getOptionLabel,
  returnType: "option",
});

const filteredOptions = computed(() =>
  isDropdownOpen.value
    ? filterOptions(
        props.options.filter((option) => {
          if (
            (props.multiple && Array.isArray(props.modelValue)
              ? props.modelValue
              : [props.modelValue as Value]
            ).some(
              (value2) =>
                value2 !== null && props.isOptionEqualToValue(option, value2)
            )
          ) {
            return false;
          }

          return true;
        }),

        {
          searchTerm: inputValueIsSelectedValue.value ? "" : inputValue.value,
        }
      )
    : []
);

// Watch query and reset selectedIndex when query changes
watch(inputValue, () => {
  selectedIndex.value = -1;
});

watch(
  () => props.modelValue,
  (prevVal, newVal) => {
    const valueChange = prevVal !== newVal;

    if (!valueChange) return;

    resetInputValue(props.modelValue as Value);
  }
);

const openDropdown = () => {
  isDropdownOpen.value = true;
};

// Define input handler, debounced if a delay is provided
const onInput = props.debounceDelay
  ? debounce(() => {
      openDropdown();
    }, props.debounceDelay)
  : () => {
      openDropdown();
    };

const handleInputChange = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  console.log("handleinputchange", newValue);
  if (inputValue.value !== newValue) {
    inputValue.value = newValue;
    // setInputPristine(false);

    // TODO: emit?
    // if (onInputChange) {
    //   onInputChange(event, newValue, "input");
    // }
  }

  if (newValue === "") {
    if (!props.disableClearable && !props.multiple) {
      handleValue(event, {} as Value);
    }
  } else {
    openDropdown();
  }
};

const handleValue = (event: Event, newValue: Value) => {
  if (
    props.multiple &&
    Array.isArray(props.modelValue) &&
    Array.isArray(newValue)
  ) {
    if (
      props.modelValue.length === newValue.length &&
      props.modelValue.every((val, i) => val === newValue[i])
    ) {
      return;
    }

    inputValue.value = "";
  } else if (props.modelValue === newValue) {
    return;
  }

  // TODO: Replaced with emit?
  // if (onChange) {
  //   onChange?.(
  //     event,
  //     newValue,
  //     reason,
  //     details as LookupChangeDetails<Value>
  //   );
  // }

  const optionLabel = props.getOptionLabel(newValue);
  inputValue.value = optionLabel;

  emit("select", newValue);
  emit("update:modelValue", newValue);
};

const resetInputValue = (newValue: Value) => {
  const isOptionselected =
    props.multiple && Array.isArray(props.modelValue) && Array.isArray(newValue)
      ? props.modelValue.length < newValue.length
      : newValue !== null;

  if (isOptionselected && !props.clearOnBlur) {
    return;
  }

  let newInputValue;
  if (props.multiple || newValue == null) {
    newInputValue = "";
  } else {
    const optionLabel = props.getOptionLabel(newValue);
    newInputValue = typeof optionLabel === "string" ? optionLabel : "";
  }

  if (inputValue.value === newInputValue) {
    return;
  }

  inputValue.value = newInputValue;

  // if (onInputChange) {
  //   onInputChange(event, newInputValue, "reset");
  // }
};

// Keyboard navigation for options
const onArrowDown = () => {
  if (selectedIndex.value < filteredOptions.value.length - 1) {
    selectedIndex.value++;
  }
};

const onArrowUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  }
};

const onEnter = (event: Event) => {
  if (
    selectedIndex.value >= 0 &&
    selectedIndex.value < filteredOptions.value.length
  ) {
    selectNewValue(event, filteredOptions.value[selectedIndex.value]!);
  }
};

const selectNewValue = (event: Event, option: Value) => {
  let newValue: Value = option;

  if (props.multiple) {
    newValue = Array.isArray(props.modelValue)
      ? (props.modelValue.slice() as Value)
      : ([] as Value);

    if (!Array.isArray(newValue)) return;

    const itemIndex = newValue.findIndex((o) =>
      props.isOptionEqualToValue(option, o)
    );

    if (itemIndex === -1) {
      newValue.push(option);
    } else if (itemIndex !== -1) {
      newValue.splice(itemIndex, 1);
    }
  }

  resetInputValue(newValue);

  handleValue(event, newValue);

  if (
    props.closeOnSelect &&
    (!event ||
      (!(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey))
  ) {
    isDropdownOpen.value = false;
  }
};

const handleTagDelete = (index: number) => (event: MouseEvent) => {
  console.info("Handle Tag Delete", index);
  if (!props.multiple || !Array.isArray(props.modelValue)) {
    return;
  }

  const newValue = props.modelValue.slice() as Value;

  if (Array.isArray(newValue)) {
    newValue.splice(index, 1);
  }

  handleValue(event, newValue);
};

// const selectOption = (event: Event, option: Value) => {
//   inputValue.value = props.getOptionLabel(option);

//   emit('select', option);
//   emit('update:modelValue', option);

//   isDropdownOpen.value = false;
// };

const autocompleteRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (!autocompleteRef.value) return console.log("no ref");

  isDropdownOpen.value = autocompleteRef.value.contains(event.target as Node);
};

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("mousedown", handleClickOutside)
);
</script>

<template>
  <div
    class="w-full max-w-xs relative"
    :class="wrapperClass"
    ref="autocompleteRef"
  >
    <div class="dropdown w-full" :class="{ 'dropdown-open': isDropdownOpen }">
      <div class="fieldset pb-0">
        <slot name="label">
          <div class="fieldset-legend" v-show="label">
            {{ label }}
          </div>
        </slot>

        <div class="input w-full flex gap-2 items-center grow">
          <template v-if="multiple && Array.isArray(props.modelValue)">
            <div
              role="button"
              v-for="(option, index) in props.modelValue"
              :key="index"
              class="badge gap-1 box-border text-nowrap select-none"
            >
              {{ getOptionLabel(option) }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-4 w-4 stroke-current leading-none"
                :onclick="handleTagDelete(index)"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </template>
          <input
            type="text"
            class="grow"
            v-model="inputValue"
            :readonly="readonly"
            @input="onInput"
            @change="handleInputChange"
            @focus="openDropdown"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
            placeholder="Search..."
          />
        </div>
      </div>
      <ul
        v-if="isDropdownOpen && filteredOptions.length && inputValue"
        class="dropdown-content menu bg-base-200 rounded-box z-50 w-52 p-2 shadow-sm"
      >
        <li
          v-for="(option, index) in filteredOptions"
          :key="index"
          @click="($event) => selectNewValue($event, option)"
        >
          <slot
            name="option"
            :option="option"
            :selected="index === selectedIndex"
          >
            <a :class="{ 'bg-primary text-white': index === selectedIndex }">
              {{ getOptionLabel(option) }}
            </a>
          </slot>
        </li>
        <li class="border-t border-neutral disabled">
          <div class="flex items-center gap-1 menu-title">
            <kbd class="kbd kbd-sm">▲</kbd>
            <kbd class="kbd kbd-sm">▼</kbd>
            <kbd class="kbd kbd-sm">Enter</kbd> to select
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
