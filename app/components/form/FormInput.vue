<script
  lang="ts"
  setup
  generic="M extends string | number | boolean | undefined | null"
>
import { computed, type InputTypeHTMLAttribute, useId } from "vue";
import {
  useInputIcons,
  type UseInputIconsProps,
} from "~/composables/useInputIcons";
/**
 * TODO: add loading state
 */

type Option = {
  value: string | number | boolean;
  label?: string;
  disabled?: boolean;
};

interface Props extends UseInputIconsProps {
  wrapperClass?: string;
  class?: any;
  type?: InputTypeHTMLAttribute | "select" | "textarea";
  options?: Option[];
  disabled?: boolean;
  label?: string;
  helpText?: string;
  join?: boolean;
  required?: boolean;
  mask?: string;
  placeholder?: string;

  // Input attributes
  min?: number | string;
  max?: number | string;
  size?: "xs" | "sm" | "md" | "lg";
  /*
   * The pattern attribute is a regular expression that the input's value must match.
   * It is used for client-side validation of the input value.
   */
  pattern?: string;
  minlength?: number;
  maxlength?: number;

  /*
   * The validate attribute is a boolean that indicates whether the input value should be validated.
   * It is used for client-side validation of the input value.
   */
  validate?: boolean | string;
  /*
   * The color attribute is used to specify the color of the input field.
   * It can be one of the following values: error, warning, success, info, accent, primary, secondary.
   */
  color?:
    | "error"
    | "warning"
    | "success"
    | "info"
    | "accent"
    | "primary"
    | "secondary";
  inputmode?:
    | "decimal"
    | "numeric"
    | "email"
    | "none"
    | "search"
    | "tel"
    | "text"
    | "url";
  tabindex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  size: "md",
  wrapperClass: "w-full",
  join: false,
  required: false,
  validate: false,
});

const emit = defineEmits<{
  change: [event: Event, value: string | number | boolean | undefined | null];
  "update:modelValue": [value: M | undefined | null];
}>();

const model = defineModel<
  Props extends { type: "select" }
    ?
        | (Props["options"] extends Array<{ value: infer V }>
            ? V
            : string | number | boolean)
        | undefined
        | null
    : Props["type"] extends "number" | "range"
      ? number | undefined | null
      : Props["type"] extends "checkbox"
        ? boolean | undefined | null
        : Props["type"] extends "text"
          ? string | undefined | null
          : M,
  PropertyKey
>({
  required: false,
});

const id = useId();

const computedType = computed(() => {
  return ["select", "range", "textarea", "checkbox", "radio"].includes(
    props.type,
  )
    ? (props.type as "select" | "textarea" | "range" | "checkbox" | "radio")
    : "input";
});

const computedClass = computed(() => {
  const colorClass = `${computedType.value}-${props.color}`;
  const sizeClass = `${computedType.value}-${props.size}`;

  return [
    computedType.value,
    props.color && colorClass,
    sizeClass,
    props.join && "join-item",
    (props.validate || props.pattern) && "validator",
    "w-full [&>svg]:z-10",
    props.class,
  ];
});

const { isLeading, isTrailing, leadingIconName, trailingIconName } =
  useInputIcons(props);

const onInput = (event: Event) => {
  const target = event.target as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;
  if (target.disabled) return;

  const rawValue = target.value;

  let value: string | number | boolean | Date | undefined | null = rawValue;
  if (props.type === "number" || props.inputmode === "numeric") {
    value = Number(value);
    if (
      props.min !== undefined &&
      typeof props.min === "number" &&
      value < props.min
    )
      value = props.min;
    if (
      props.max !== undefined &&
      typeof props.max === "number" &&
      value > props.max
    )
      value = props.max;
  }

  emit("update:modelValue", value as M);
};

const onChange = (event: Event) => {
  const rawValue = (event.target as HTMLInputElement)?.value;

  emit("change", event, rawValue);
};
</script>

<template>
  <div class="fieldset" :class="[{ 'join-item': join }, wrapperClass]">
    <slot name="label" :label="`${label}${required ? ' *' : ''}`">
      <label v-if="!!label" class="fieldset-legend" :for="id">
        {{ label }}
        {{ required ? "*" : "" }}
      </label>
    </slot>

    <textarea
      v-if="typeof model !== 'boolean' && type === 'textarea'"
      v-bind="$attrs"
      v-model="model"
      :id="id"
      :class="computedClass"
      :required="required"
      :placeholder="placeholder"
      :minlength="minlength"
      :maxlength="maxlength"
      :pattern="pattern"
      :tabindex="tabindex"
      :disabled="disabled"
    ></textarea>

    <label v-else :class="computedClass">
      <slot v-if="isLeading || !!avatar || !!$slots.leading" name="leading">
        <span
          v-if="isLeading && leadingIconName && loading"
          :class="leadingIconName"
        ></span>
        <Icon
          v-else-if="isLeading && leadingIconName"
          :name="leadingIconName"
          size="1.2em"
        />
        <AvatarImage v-else-if="!!avatar" v-bind="avatar" />
      </slot>

      <slot name="input">
        <select
          v-if="type === 'select'"
          :id="id"
          v-bind="$attrs"
          :value="model ?? ''"
          class="grow"
          :inputmode="inputmode"
          :required="required"
          :placeholder="placeholder"
          :minlength="minlength"
          :maxlength="maxlength"
          :pattern="pattern"
          :tabindex="tabindex"
          :disabled="disabled"
          @change="onInput"
        >
          <option v-if="model == null" disabled selected value="" hidden>
            {{ placeholder }}
          </option>
          <option
            v-for="(option, idx) in options"
            :key="`option-${idx}`"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label ?? option.value }}
          </option>
        </select>

        <input
          v-else
          :id="id"
          :type="type"
          v-bind="$attrs"
          :value="model ?? ''"
          class="grow"
          :inputmode="inputmode"
          :required="required"
          :placeholder="placeholder"
          :minlength="minlength"
          :maxlength="maxlength"
          :min="min"
          :max="max"
          :pattern="pattern"
          :tabindex="tabindex"
          :disabled="disabled"
          @input="onInput"
          @change="onChange"
        />
      </slot>

      <slot v-if="isTrailing || !!$slots.trailing" name="trailing">
        <span
          v-if="trailingIconName && loading"
          :class="trailingIconName"
        ></span>
        <Icon
          v-else-if="trailingIconName"
          :name="trailingIconName"
          size="1.2em"
        />
      </slot>
    </label>

    <div
      v-if="validate && typeof validate == 'string' && validate !== ''"
      class="validator-hint"
    >
      <slot name="validatorHint">
        {{ typeof validate == "string" ? validate : "" }}
      </slot>
    </div>

    <slot name="helpText">
      <div class="label" v-if="helpText">
        <span class="label-text-alt">{{ helpText }}</span>
      </div>
    </slot>
  </div>
</template>
