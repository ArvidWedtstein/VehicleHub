export const formatDate = (
  dateTime: string | Date,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "long",
    timeStyle: undefined,
  },
) => {
  const language = useLocale();
  const formattedDateTime = new Date(dateTime).toLocaleString(
    language.value,
    options,
  );

  return formattedDateTime;
};

const UNITS = [
  "byte",
  "kilobyte",
  "megabyte",
  "gigabyte",
  "terabyte",
  "petabyte",
];
export const formatFileSize = (
  size: number,
  options: Omit<Intl.NumberFormatOptions, "style" | "unit"> = {
    maximumFractionDigits: 2,
  },
) => {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));

  const value = size / Math.pow(1024, i);

  const formattedValue = formatNumber(value, {
    style: "unit",
    unit: UNITS[i],
    ...options,
  });

  return formattedValue;
};

/**
 * Formats a list of strings as a sentence with "or" as the final separator.
 * Similar to Intl.ListFormat with type: "disjunction" and style: "long".
 *
 * @param items - Array of strings to be formatted
 * @returns A formatted string, e.g., "JPG, PNG, or GIF"
 */
export const formatListDisjunction = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
};

/**
 * Formats numbers
 *
 * @param {number} num
 * @returns A formatted string of your number
 */
export const formatNumber = (
  num: number | bigint | undefined | null = 0,
  options: Intl.NumberFormatOptions = { style: "decimal" },
) => {
  if (!num && num !== 0) return "";
  const language = useLocale();

  try {
    const formatter = new Intl.NumberFormat(language.value, options);

    return formatter.format(num);
  } catch (error) {
    if (!error) return "";

    // Add all the extra units Intl doesn't support (yet)
    const extraUnits = {
      // Volume
      "cubic-millimeter": "mm³",
      "cubic-centimeter": "cm³",
      "cubic-meter": "m³",
      "cubic-kilometer": "km³",
      "cubic-inch": "in³",
      "cubic-foot": "ft³",
      "cubic-yard": "yd³",
      "meter-per-square-second": "m/s²",
      knot: "kn",
      pint: "pt",
      quart: "qt",
      tablespoon: "tbsp",
      teaspoon: "tsp",
      barrel: "bbl",
      karat: "kt",
      // Power & Energy
      milliampere: "mA",
      ampere: "A",
      watt: "W",
      milliwatt: "mW",
      gigawatt: "gW",
      volt: "V",
      kilovolt: "kV",
      megavolt: "MV",
      gigavolt: "GV",
      teravolt: "TV",
      ohm: "Ω",
      milliohm: "mΩ",
      kilohm: "kΩ",
      megohm: "MΩ",
      gigohm: "GΩ",
      joule: "J",
      hertz: "Hz",
      kilohertz: "kHz",
      megahertz: "MHz",
      gigahertz: "GHz",
      terahertz: "THz",
      horsepower: "hp",
    };

    const extraUnit = (options.unit || "") as keyof typeof extraUnits;

    const unit = extraUnit in extraUnits ? extraUnits[extraUnit] : "N/A";

    delete options.style;
    delete options.unit;

    const formatter = new Intl.NumberFormat(language.value, options);
    return `${formatter.format(num)} ${unit}`;
  }
};

type Bytes = "bytes" | "kilobytes" | "megabytes" | "gigabytes" | "terabytes";

export const convertBytes = (value: number, fromUnit: Bytes, toUnit: Bytes) => {
  if (typeof value !== "number" || value < 0) {
    throw new Error("Input must be a non-negative number.");
  }

  const units = {
    bytes: 1,
    kilobytes: 1024,
    megabytes: 1024 * 1024,
    gigabytes: 1024 * 1024 * 1024,
    terabytes: 1024 * 1024 * 1024 * 1024,
  };

  if (!units[fromUnit] || !units[toUnit]) {
    throw new Error(
      "Invalid unit specified. Supported units are: bytes, kilobytes, megabytes, gigabytes, terabytes.",
    );
  }

  return (value * units[fromUnit]) / units[toUnit];
};

export const inchesToMetric = (
  inches: number,
  unit: "mm" | "cm" | "m" | "auto" = "auto",
): string => {
  if (inches < 0) return "Invalid measurement"; // Handle negative values

  const mm = inches * 25.4; // Convert inches to millimeters

  switch (unit) {
    case "mm":
      return `${mm.toFixed(1)} mm`;
    case "cm":
      return `${(mm / 10).toFixed(1)} cm`;
    case "m":
      return `${(mm / 1000).toFixed(2)} m`;
    case "auto":
    default:
      if (mm >= 1000) return `${(mm / 1000).toFixed(2)} m`;
      if (mm >= 10) return `${(mm / 10).toFixed(1)} cm`;
      return `${mm.toFixed(1)} mm`;
  }
};

/**
 * Tire size format: [width]/[aspect ratio]R[diameter][load index]
 * Example: 205/55R16 91V
 *
 * The aspectRatio number is the relationship between a tyre's sidewall height and the tyre's width.
 *
 * Number behind R is expressed in inches and indicates the diameter of the wheel on which the tyre is designed to fit.
 */
export const parseTireSize = (tireSize: string) => {
  const tireSizeRegex =
    /^(LT|P)?(\d{3})[/x](\d{2,3})R(\d{2})(?:ZR)?(?:\s*(\d{2,3})[A-Z]?)?$/i;

  const match = tireSize.match(tireSizeRegex);

  if (!match) return null;

  return {
    prefix: match[1] || null, // "LT" or "P" (optional)
    width: Number(match[2]), // 225, 195, etc.
    aspectRatio: Number(match[3]), // 50, 65, etc.
    rimDiameter: Number(match[4]), // 17, 15, etc.
    loadIndex: match[5] ? Number(match[5]) : null, // 94, 91, etc. (optional)
  };
};

/**
 *
 * @param rimSize
 * @returns
 *
 * Rim size format: [diameter]x[width] [ET][bolt pattern]
 * Example: 17x7.5 ET35 5x114.3
 *
 * - The rimDiameter number is the diameter of the wheel in inches.
 * - The rimWidth number is the width of the wheel in inches.
 * - The offsetET number is the distance between the centerline of the wheel and the mounting surface of the wheel.
 * - The boltPatternLugCount number is the number of bolts on the wheel.
 * - The boltPatternDiameter number is the diameter of the circle that the bolts form in inches.
 *
 */
export const parseRimSize = (rimSize: string) => {
  const rimSizeRegex =
    /^(\d{2})x(\d{1,2}(?:\.\d)?)\s*(?:ET(-?\d{1,3}))?\s*(?:([4-8])x(\d{2,3}(?:\.\d+)?))?$/i;

  const match = rimSize.match(rimSizeRegex);
  if (!match) return null;

  return {
    rimDiameter: Number(match[1]),
    rimWidth: Number(match[2]),
    offsetET: match[3] ? Number(match[3]) : null,
    boltPatternLugCount: match[4] ? Number(match[4]) : null,
    boltPatternDiameter: match[5] ? Number(match[5]) : null,
  };
};

export const convertImageUrlToBase64 = (url: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const res = await fetch(url);
    const blob = await res.blob();

    if (!blob) {
      reject("Blob not found");
      return;
    }

    const blobUrl = URL.createObjectURL(blob);

    const image = new window.Image();
    image.src = blobUrl;
    image.crossOrigin = "Anonymous";
    image.addEventListener("load", () => {
      resolve(blobUrl);
    });
    image.addEventListener("error", reject);
  });
};

export const mimeToExtension = (mime: string): string => {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };

  return map[mime] ?? "jpg"; // safe fallback
};

export function parseAcceptToDataTypes(accept: string): string[] | undefined {
  if (!accept || accept === "*") {
    return undefined;
  }

  const types = accept
    .split(",")
    .map((type) => {
      const trimmedType = type.trim();

      if (trimmedType.includes("/") && trimmedType.endsWith("/*")) {
        return trimmedType.split("/")[0] || trimmedType;
      }
      return trimmedType;
    })
    .filter((type) => {
      return !type.startsWith(".");
    });

  return types.length > 0 ? types : undefined;
}
