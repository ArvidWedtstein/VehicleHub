<script setup lang="ts">
import {
  CalendarDate,
  CalendarDateTime,
  parseDateTime,
  Time,
} from "@internationalized/date";

interface InputDateTimeProps {
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral";
  variant?: "outline" | "soft" | "subtle" | "ghost" | "none";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  hourCycle?: 12 | 24;
  granularity?: "hour" | "minute" | "second";
  disabled?: boolean;
  readonly?: boolean;
  minValue?: CalendarDateTime;
  maxValue?: CalendarDateTime;
}

const props = withDefaults(defineProps<InputDateTimeProps>(), {
  color: "primary",
  variant: "outline",
  size: "md",
  granularity: "minute",
  hourCycle: 24,
});

const modelValue = defineModel<string | CalendarDateTime | undefined>({
  default: undefined,
});

const inputDate = useTemplateRef("inputDate");

const isStringMode = computed(() => typeof modelValue.value === "string");

const internalValue = computed<CalendarDateTime | null>(() => {
  if (!modelValue.value) return null;
  if (typeof modelValue.value === "string") {
    try {
      return parseDateTime(modelValue.value);
    } catch {
      return null;
    }
  }
  return modelValue.value;
});

function emit(value?: CalendarDateTime) {
  if (!value) {
    modelValue.value = undefined;
    return;
  }
  modelValue.value = isStringMode.value ? value.toString() : value;
}
const dateValue = computed({
  get: () =>
    internalValue.value
      ? new CalendarDate(
          internalValue.value.year,
          internalValue.value.month,
          internalValue.value.day,
        )
      : null,
  set: (date: CalendarDate | null) => {
    if (!date) return emit(undefined);
    const current = internalValue.value;
    emit(
      new CalendarDateTime(
        date.year,
        date.month,
        date.day,
        current?.hour ?? 0,
        current?.minute ?? 0,
        current?.second ?? 0,
        current?.millisecond ?? 0,
      ),
    );
  },
});

const timeValue = computed({
  get: () =>
    internalValue.value
      ? new Time(
          internalValue.value.hour,
          internalValue.value.minute,
          internalValue.value.second,
          internalValue.value.millisecond,
        )
      : null,
  set: (time: Time | null) => {
    if (!time) return emit(undefined);
    const current = internalValue.value;
    const today = new CalendarDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate(),
    );
    emit(
      new CalendarDateTime(
        current?.year ?? today.year,
        current?.month ?? today.month,
        current?.day ?? today.day,
        time.hour,
        time.minute,
        time.second,
        time.millisecond,
      ),
    );
  },
});

const sharedProps = computed(() => ({
  color: props.color,
  variant: props.variant,
  size: props.size,
  disabled: props.disabled,
  readonly: props.readonly,
}));
</script>

<template>
  <UInputDate
    ref="inputDate"
    v-model="dateValue"
    v-bind="sharedProps"
    granularity="day"
    :minValue="minValue"
    :maxValue="maxValue"
    :hideTimeZone="false"
  >
    <template #trailing>
      <USeparator orientation="vertical" />
      <UInputTime
        v-model="timeValue"
        v-bind="sharedProps"
        :granularity="granularity"
        :hourCycle="hourCycle"
        :minValue="minValue"
        :maxValue="maxValue"
        variant="none"
        class="py-0"
      />

      <UPopover :reference="inputDate?.inputsRef[3]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="mdi:calendar"
          aria-label="Select a date"
        />

        <template #content>
          <UCalendar v-model="dateValue" class="p-2" />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
