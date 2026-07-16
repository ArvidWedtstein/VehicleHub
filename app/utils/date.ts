const DAY_NAMES = [
  {
    long: "Monday",
    short: "Mon",
  },
  {
    long: "Tuesday",
    short: "Tue",
  },
  {
    long: "Wednesday",
    short: "Wed",
  },
  {
    long: "Thursday",
    short: "Thu",
  },
  {
    long: "Friday",
    short: "Fri",
  },
  {
    long: "Saturday",
    short: "Sat",
  },
  {
    long: "Sunday",
    short: "Sun",
  },
];

const MONTH_NAMES = [
  {
    long: "January",
    short: "Jan",
  },
  {
    long: "February",
    short: "Feb",
  },
  {
    long: "March",
    short: "Mar",
  },
  {
    long: "April",
    short: "Apr",
  },
  {
    long: "May",
    short: "May",
  },
  {
    long: "June",
    short: "Jun",
  },
  {
    long: "July",
    short: "Jul",
  },
  {
    long: "August",
    short: "Aug",
  },
  {
    long: "September",
    short: "Sep",
  },
  {
    long: "October",
    short: "Oct",
  },
  {
    long: "November",
    short: "Nov",
  },
  {
    long: "December",
    short: "Dec",
  },
];

export const convertLocalToUTC = (
  localDate: string | number | Date = new Date(),
) => {
  const utcDate = new Date(localDate);
  return utcDate.toISOString();
};

export const addToDate = (
  date: Date | string,
  value: number = 0,
  unit: "minutes" | "hour" | "day" | "week" | "month" | "year" = "day",
) => {
  const result = new Date(date);

  switch (unit) {
    case "minutes":
      result.setMinutes(result.getMinutes() + value);
      break;
    case "hour":
      result.setHours(result.getHours() + value);
      break;
    case "day":
      result.setDate(result.getDate() + value);
    case "week":
      result.setDate(result.getDate() + value * 7);
      break;
    case "month":
      result.setMonth(result.getMonth() + value);
      break;
    case "year":
      result.setFullYear(result.getFullYear() + value);
      break;
  }

  return result;
};

export const getWeekNumber = (d: Date) => {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
};

export const formatDateToFormat = (
  date: Date | string,
  format: string,
): string => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const pad = (num: number) => num.toString().padStart(2, "0");
  const hours12 = date.getHours() % 12 || 12;

  const replacements: { [key: string]: string } = {
    d: date.getDate().toString(),
    dd: pad(date.getDate()),
    ddd: DAY_NAMES[date.getDay()]?.short || "",
    dddd: DAY_NAMES[date.getDay()]?.long || "",
    M: (date.getMonth() + 1).toString(),
    MM: pad(date.getMonth() + 1),
    MMM: MONTH_NAMES[date.getMonth()]?.short || "",
    MMMM: MONTH_NAMES[date.getMonth()]?.long || "",
    yy: date.getFullYear().toString().slice(-2),
    yyyy: date.getFullYear().toString(),
    h: hours12.toString(),
    hh: pad(hours12),
    H: date.getHours().toString(),
    HH: pad(date.getHours()),
    m: date.getMinutes().toString(),
    mm: pad(date.getMinutes()),
    s: date.getSeconds().toString(),
    ss: pad(date.getSeconds()),
    a: date.getHours() < 12 ? "AM" : "PM",
    G: date.getFullYear() >= 0 ? "AD" : "BC",
    GGGG: date.getFullYear() >= 0 ? "Anno Domini" : "Before Christ",
    Q: (Math.floor(date.getMonth() / 3) + 1).toString(),
    Qo: ["1st", "2nd", "3rd", "4th"][Math.floor(date.getMonth() / 3)] || "",
    W: getWeekNumber(date).toString(),
    WW: pad(getWeekNumber(date)),
    Y: date.getFullYear().toString(),
  };

  return format.replace(
    /dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|HH|H|hh|h|mm|m|ss|s|a|GGGG|GG|G|Qo|Q|WW|W|Y/g,
    (match) => replacements[match] || match,
  );
};

/**
 * Get Start or End of a period
 * @param date
 * @param type
 * @param period
 * @param startOn
 * @returns
 *
 */
export const adjustCalendarDate = (
  type: "start" | "end",
  period: "day" | "week" | "month" | "year" = "day",
  date: Date = new Date(),
  startOn = 0,
): Date => {
  const result = new Date(date);

  if (type === "start") {
    if (period === "day") {
      result.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      const dayOfWeek = result.getUTCDay();
      const diff = (dayOfWeek - startOn + 7) % 7;
      result.setDate(result.getUTCDate() - diff);
    } else if (period === "month") {
      result.setDate(1);
    } else if (period === "year") {
      result.setMonth(0, 1);
      result.setHours(0, 0, 0);
    }
  } else if (type === "end") {
    if (period === "day") {
      result.setHours(23, 59, 59, 999);
    } else if (period === "month") {
      result.setMonth(result.getMonth() + 1, 0);
    } else if (period === "week") {
      const dayOfWeek = result.getDay();
      const diff = (6 - dayOfWeek + (7 + startOn)) % 7;
      result.setDate(result.getDate() + diff);
    } else if (period === "year") {
      result.setMonth(11, 31);
      // result.setUTCHours(2, 0, 0, 0);
    }
  }

  return result;
};

type DateRangeResult<
  T extends "months" | "days" | "years" | "weeks",
  R extends "date" | "object",
> = R extends "date"
  ? Date[]
  : T extends "days"
    ? { year: number; month: number; date: number }[]
    : T extends "months"
      ? { year: number; month: number }[]
      : T extends "weeks"
        ? { year: number; week: number }[]
        : { year: number }[];

/**
 * Gets years, dates and months between two dates
 *
 * @param startDate
 * @param endDate
 * @param unit
 * @returns
 */
export const getRangeBetweenDates = <
  T extends "months" | "days" | "years" | "weeks",
  R extends "date" | "object" = "object",
>(
  startDate: Date,
  endDate: Date,
  unit: T,
  returnAs: R = "object" as R,
): DateRangeResult<T, R> => {
  const result: (
    | Date
    | { year: number; month?: number; date?: number; week?: number }
  )[] = [];
  const start = new Date(startDate.setHours(0, 0, 0, 0));
  const end = new Date(endDate.setHours(0, 0, 0, 0));

  switch (unit) {
    case "days": {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        result.push(
          returnAs === "date"
            ? new Date(d)
            : {
                date: d.getDate(),
                month: d.getMonth() + 1,
                year: d.getFullYear(),
              },
        );
      }
      break;
    }
    case "weeks": {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
        result.push(
          returnAs === "date"
            ? new Date(d)
            : {
                week: getWeekNumber(d),
                year: d.getFullYear(),
              },
        );
      }
      break;
    }
    case "months": {
      for (
        let m = new Date(start.getFullYear(), start.getMonth(), 1, 1);
        m <= new Date(end.getFullYear(), end.getMonth(), 1, 1);
        m.setMonth(m.getMonth() + 1, 1)
      ) {
        result.push(
          returnAs === "date"
            ? new Date(m)
            : {
                month: m.getMonth(),
                year: m.getFullYear(),
              },
        );
      }
      break;
    }
    case "years": {
      for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        result.push(returnAs === "date" ? new Date(year, 0, 1) : { year });
      }
      break;
    }
    default:
      throw new Error("Invalid unit specified");
  }

  return result as DateRangeResult<T, R>;
};
