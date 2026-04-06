<script setup lang="ts">
// TODO: add max and min option.
// TODO: add range?

const selectedDate = defineModel<Date>({
  required: false,
  default: new Date(),
});

type Settings = {
  view: "day" | "year" | "month" | "week";
  selectedPeriod: string;
};
const settings = reactive<Settings>({
  view: "day",
  selectedPeriod: formatDateToFormat(new Date(), "yyyy-MM"),
});

const locale = useLocale();

const daysOfMonth = computed(() => {
  const startOfMonth = adjustCalendarDate(
    "start",
    "month",
    new Date(settings.selectedPeriod),
    1,
  );

  const endOfMonth = adjustCalendarDate(
    "end",
    "month",
    new Date(settings.selectedPeriod),
    1,
  );

  const startOfWeekInMonth = adjustCalendarDate(
    "start",
    "week",
    startOfMonth,
    1,
  );
  const endOfWeekInMonth = adjustCalendarDate("end", "week", endOfMonth, 1);

  return getRangeBetweenDates(
    startOfWeekInMonth,
    endOfWeekInMonth,
    "days",
    "date",
  );
});

// For selecting year and month
const years = Array.from(
  { length: 2100 - 1900 + 1 },
  (_, index) => 1900 + index,
);

const soYearDate = adjustCalendarDate("start", "year");
const eoYearDate = adjustCalendarDate("end", "year");
const months = getRangeBetweenDates(soYearDate, eoYearDate, "months", "date");

const soWeekDate = adjustCalendarDate("start", "week");
const eoWeekDate = adjustCalendarDate("end", "week");
const weekDays = getRangeBetweenDates(
  soWeekDate,
  eoWeekDate,
  "weeks",
  "date",
).map((day) => day.toLocaleDateString(locale.value, { weekday: "narrow" }));

const handleDateSelect = (date: Date) => {
  const { selectedPeriod } = settings;

  const currentYear = Number(selectedPeriod.substring(0, 4));
  const currentMonth = Number(selectedPeriod.substring(5)) - 1;

  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth();

  selectedDate.value = date;

  const monthDiff =
    (selectedYear - currentYear) * 12 + (selectedMonth - currentMonth);

  if (monthDiff !== 0) {
    navigateMonth(monthDiff > 0 ? 1 : -1);
  }
};

const navigateMonth = (change: -1 | 1) => {
  const newDate = addToDate(new Date(settings.selectedPeriod), change, "month");

  settings.selectedPeriod = formatDateToFormat(newDate, "yyyy-MM");
};

const selectYear = (year: number) => {
  const newDate = new Date(settings.selectedPeriod);
  newDate.setFullYear(year);

  settings.selectedPeriod = formatDateToFormat(newDate, "yyyy-MM");

  setView("day");
};

const selectMonth = (month: number) => {
  const newDate = new Date(settings.selectedPeriod);
  newDate.setMonth(month);

  settings.selectedPeriod = formatDateToFormat(newDate, "yyyy-MM");

  setView("year");
};

const setView = (view: Settings["view"]) => {
  settings.view = view;
  console.log("view changed to", view);
};
</script>

<template>
  <Menu
    v-bind="$attrs"
    menuClass="w-64 max-h-96 bg-base-300 rounded-box"
    autoClose="none"
  >
    <template #default="{ toggle }">
      <button type="button" class="btn btn-outline" @click="toggle()">
        Date
      </button>
    </template>
    <template #items>
      <div
        class="text-center lg:col-start-9 lg:col-end-13 lg:row-start-1 xl:col-start-9"
      >
        <div class="flex items-center">
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost"
            @click="navigateMonth(-1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="w-5 h-5 fill-current"
            >
              <path
                fill-rule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <div class="flex-auto">
            <button tabindex="0" class="btn btn-sm" @click="setView('year')">
              {{
                new Date(settings.selectedPeriod).toLocaleDateString(locale, {
                  month: "long",
                  year: "numeric",
                })
              }}
            </button>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost"
            @click="navigateMonth(1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="w-5 h-5 fill-current"
            >
              <path
                fill-rule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <template v-if="settings.view === 'day'">
          <div class="mt-6 grid grid-cols-7 text-xs">
            <div v-for="(weekDay, idx) in weekDays" :key="idx">
              {{ weekDay }}
            </div>
          </div>

          <div
            class="isolate mt-2 grid grid-cols-7 rounded-lg bg-neutral text-sm ring-1 ring-neutral gap-px"
          >
            <button
              v-for="(date, dateIndex) in daysOfMonth"
              :key="`date-${dateIndex}`"
              type="button"
              class="py-1.5 hover:bg-base-200/80"
              :class="{
                'rounded-tl-lg': dateIndex === 0,
                'rounded-tr-lg': dateIndex === 6,
                'rounded-bl-lg': dateIndex === daysOfMonth.length - 7,
                'rounded-br-lg': dateIndex === daysOfMonth.length - 1,
                'bg-neutral/30 opacity-50 text-neutral-content':
                  formatDateToFormat(date, 'yyyy-MM') !==
                  settings.selectedPeriod,
                'bg-base-200 text-base-content':
                  formatDateToFormat(date, 'yyyy-MM') ===
                  settings.selectedPeriod,
                'text-secondary':
                  formatDate(date) === formatDate(new Date()) &&
                  formatDate(date) !== formatDate(selectedDate),
              }"
              @click="handleDateSelect(date)"
            >
              <time
                :datetime="formatDateToFormat(date, 'yyyy-MM')"
                class="mx-auto flex h-7 w-7 items-center justify-center rounded-full"
                :class="{
                  'font-semibold':
                    formatDate(date) === formatDate(new Date()) ||
                    formatDate(date) === formatDate(selectedDate),
                  'bg-primary text-primary-content':
                    formatDate(date) === formatDate(selectedDate),
                }"
              >
                {{ date.getDate() }}
              </time>
            </button>
          </div>
        </template>

        <div
          class="relative mt-2 flex flex-wrap justify-center rounded-lg h-full max-h-72 text-sm ring-1 ring-neutral gap-2 p-1 overflow-y-auto box-border"
          v-else-if="settings.view === 'month'"
        >
          <button
            v-for="(month, idx) in months"
            :key="idx"
            type="button"
            class="badge badge-lg hover:badge-neutral"
            :class="{
              'badge-primary':
                month.getMonth() ===
                new Date(settings.selectedPeriod).getMonth(),
            }"
            @click.stop="selectMonth(month.getMonth())"
          >
            {{ month.toLocaleDateString(locale, { month: "short" }) }}
          </button>
        </div>

        <!-- TODO: fix scrollposition so that it lands on current year on opening -->
        <div
          class="relative mt-2 flex flex-wrap content-center rounded-lg h-full max-h-72 text-sm ring-1 ring-neutral gap-2 p-1 overflow-y-auto box-border"
          v-else-if="settings.view === 'year'"
        >
          <button
            v-for="year in years"
            :key="year"
            type="button"
            class="badge badge-lg hover:badge-neutral"
            :class="{
              'badge-primary':
                year === new Date(settings.selectedPeriod).getFullYear(),
            }"
            @click.stop="selectYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </template>
  </Menu>
</template>
