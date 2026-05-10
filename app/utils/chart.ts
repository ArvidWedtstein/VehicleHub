export type ScaleTypes =
  | "band"
  | "linear"
  | "log"
  | "point"
  | "pow"
  | "sqrt"
  | "time"
  | "utc";

export type ChartBounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
};

type ContinuousScale = (v: number | Date) => number;

type BandScale = {
  (v: string | number): number;
  bandwidth: number;
  step: number;
};

export type TickLabelPlacement = "middle" | "tick";

const offsetRatio = {
  start: 0,
  extremities: 0,
  end: 1,
  middle: 0.5,
} as const;

export const numberToChart = (
  min: number | string | Date,
  max: number | string | Date,
  value: number | string | Date,
  axis: "x" | "y",
  scaleType: ScaleTypes,
  chartBounds: ChartBounds,
) => {
  const { width, height, left, right, top, bottom } = chartBounds;

  const scaleSize = axis === "x" ? width : height;
  const scaleMin = axis === "x" ? left : top;
  const scaleMax = axis === "x" ? right : bottom;

  const formattedMin =
    min instanceof Date ? min.getTime() : typeof min === "string" ? 0 : min;
  const formattedMax =
    max instanceof Date ? max.getTime() : typeof max === "string" ? 0 : max;

  const formattedValue =
    value instanceof Date
      ? value.getTime()
      : typeof value === "string"
        ? 0
        : value;

  const range =
    scaleType === "log"
      ? Math.log(formattedMax) - Math.log(formattedMin)
      : formattedMax - formattedMin;

  const relativeValue = (formattedValue - formattedMin) / range;

  const scaledValue = scaleMin + relativeValue * scaleSize;

  if (scaleType === "log") {
    const normalized =
      (Math.log(formattedValue) - Math.log(formattedMin)) / range;

    return scaleMin + normalized * scaleSize;
  }

  return axis === "x" ? scaledValue : scaleMax - (scaledValue - scaleMin);
};

/**
 *
 * @param axis
 * @param min
 * @param max
 * @param {ScaleTypes} [scaleType='linear'] - Type of scaling
 * @param numTicks
 * @param chartBounds
 * @param data
 * @param tickPlacement
 * @param {TickLabelPlacement} [tickLabelPlacement='tick'] - Position of label
 * @returns
 */
export const generateAxisTicks = (
  axis: "x" | "y",
  min: number | string | Date,
  max: number | string | Date,
  scaleType: ScaleTypes = "linear",
  chartBounds: ChartBounds,
  numTicks: number = 0,
  data: (string | number)[] | number[] | Date[] = [],
  tickPlacement: "start" | "end" | "middle" | "extremities" = "extremities",
  tickLabelPlacement: TickLabelPlacement = "tick",
) => {
  const { width, height } = chartBounds;

  const size = axis === "x" ? width : height;

  const formattedMin =
    min instanceof Date ? min.getTime() : typeof min === "string" ? 0 : min;
  const formattedMax =
    max instanceof Date ? max.getTime() : typeof max === "string" ? 0 : max;

  const idealStepCount = Math.max(2, Math.ceil(size / Math.sqrt(size)));

  // Calculate the raw step size
  const rawStepSize = (formattedMax - formattedMin) / idealStepCount;

  // Calculate a rounded step size for even steps
  const stepExponent = Math.floor(Math.log10(rawStepSize)); // log10 / log?

  const stepMultiplier = Math.pow(
    formattedMax - formattedMin <= 100
      ? formattedMax - formattedMin <= 20 // 10 // TODO: fix
        ? 1
        : 10
      : 5,
    stepExponent,
  );

  const stepSize = Math.ceil(rawStepSize / stepMultiplier) * stepMultiplier;

  const adjustedMin = formattedMin - (formattedMin % stepMultiplier);
  const adjustedMax =
    data.length > 0
      ? formattedMax
      : Math.ceil((formattedMax - formattedMin) / stepSize) * stepSize;

  // Calculate the number of steps based on the rounded step size
  const stepCount =
    scaleType === "band" || scaleType === "point"
      ? numTicks
      : Math.round((formattedMax - formattedMin) / stepSize);

  // console.log(
  //   axis,
  //   [
  //     `StepC: ${idealStepCount} | ${stepCount}`,
  //     `Size: ${stepSize} | ${rawStepSize}`,
  //     `Min/Max: ${adjustedMin} | ${adjustedMax}`,
  //     `Mult: ${stepMultiplier}`,
  //     `Expo: ${stepExponent}`,
  //   ].join('\n'),
  // );

  const axisTicks = Array.from(
    {
      length: stepCount + 1,
    },
    (_, i) => {
      const step = size / stepCount;

      const value =
        (isFinite(adjustedMin) && adjustedMin !== 0 ? adjustedMin : 0) +
        i * (scaleType === "band" || scaleType === "point" ? step : stepSize);

      const adjustedValue =
        scaleType === "log"
          ? isFinite(value)
            ? value
            : 0
          : scaleType === "band" || scaleType === "point"
            ? (data || [])[i]
            : scaleType === "time" || scaleType === "utc"
              ? new Date(value)
              : value;

      // TODO: fix
      let coord =
        scaleType === "band" || scaleType === "point"
          ? value
          : numberToChart(
              adjustedMin,
              adjustedMax,
              value,
              axis,
              scaleType,
              chartBounds,
            );

      if (scaleType === "band" || scaleType === "point") {
        coord =
          axis === "x" ? chartBounds.left + coord : chartBounds.bottom - coord;
      }

      const labelOffset =
        tickLabelPlacement === "tick"
          ? 0
          : step *
            (offsetRatio[tickLabelPlacement] - offsetRatio[tickPlacement]);

      const tickX = axis === "x" ? 0 : -6;
      const tickY = axis === "x" ? 6 : 0;

      const labelX = axis === "x" ? labelOffset : -9;
      const labelY =
        axis === "x"
          ? 9
          : scaleType === "band" || scaleType === "point"
            ? -labelOffset
            : labelOffset;

      return {
        coord,
        label: adjustedValue,
        value,
        tickX,
        tickY,
        labelX,
        labelY,
        index: i,
      };
    },
  );

  return axisTicks;
};

export const generateTicks = (
  min: number | Date | string,
  max: number | Date | string,
  numTicks: number,
  scaleType: ScaleTypes,
  data: (string | number)[] | number[] | Date[] = [],
) => {
  if (
    scaleType === "log" &&
    typeof min === "number" &&
    typeof max === "number"
  ) {
    // Log scale requires a logarithmic progression
    const logTicks = [];
    const minLog = Math.ceil(Math.log10(min));
    const maxLog = Math.floor(Math.log10(max));

    for (let i = minLog; i <= maxLog; i++) {
      logTicks.push({ value: Math.pow(10, i), index: i });
    }

    return logTicks;
  }

  if (scaleType === "time" || scaleType === "utc") {
    const step =
      (new Date(max).getTime() - new Date(min).getTime()) / (numTicks - 1);

    return Array.from({ length: numTicks }, (_, i) => {
      const val = Math.round(new Date(min).getTime() + i * step);
      const date = new Date(val);
      date.setUTCHours(0, 0, 0);

      return {
        value: date,
        index: i,
      };
    });
  }

  if (data.length > 0) {
    return (
      data
        // .sort((a, b) =>
        //   typeof a === 'string' && typeof b === 'string'
        //     ? b.localeCompare(a)
        //     : typeof a === 'number' && typeof b === 'number'
        //       ? b - a
        //       : 0,
        // )
        .map((val, index) => {
          return {
            value: val,
            index: index,
          };
        })
    );
  }

  if (typeof min !== "number" || typeof max !== "number") return [];

  const range = max - min;

  const roughStep = range / Math.max(5, numTicks);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const step = Math.ceil(roughStep / magnitude) * magnitude;

  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  const ticks = [];

  for (let tick = start; tick <= end; tick += step) {
    const index = tick / step;

    ticks.push({ value: tick, index });
  }

  return ticks;
};

export const scale = <S extends ScaleTypes>(
  value: number | string | Date,
  axis: "x" | "y" = "x",
  scaleType: S,
  ticks: {
    value: number | Date | string;
    index: number;
  }[],
  chartBounds: ChartBounds,
  tickPlacement: "start" | "end" | "middle" | "extremities" = "extremities",
  tickLabelPlacement: "middle" | "tick" = "tick",
) => {
  const { left, right, top, bottom, width, height } = chartBounds;

  const scaleSize = axis === "x" ? width : height;

  const rangeMin = axis === "x" ? left : top;
  const rangeMax = axis === "x" ? right : bottom;

  if (ticks.length === 0) {
    return {
      coord: rangeMin,
      labelOffset: 0,
    };
  }

  if (scaleType === "linear" || scaleType === "log" || scaleType === "sqrt") {
    const { min, max } = getMinMax(ticks.map(({ value }) => value));
    const minMaxIsNum = typeof min === "number" && typeof max === "number";

    if (scaleType === "linear" && minMaxIsNum) {
      if (typeof value !== "number") return { coord: rangeMin, labelOffset: 0 };

      const normalized = (value - min) / Math.ceil(max - min);
      const scaledValue = rangeMin + normalized * scaleSize;

      return {
        coord: axis === "x" ? scaledValue : rangeMax - (scaledValue - rangeMin),
        labelOffset: 0,
      };
    }

    if (scaleType === "log" && typeof value === "number" && minMaxIsNum) {
      const normalized =
        (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));

      return { coord: rangeMin + normalized * scaleSize, labelOffset: 0 };
    }

    if (scaleType === "sqrt" && typeof value === "number" && minMaxIsNum) {
      const normalized =
        (Math.sqrt(value) - Math.sqrt(min)) / (Math.sqrt(max) - Math.sqrt(min));

      return { coord: rangeMin + normalized * scaleSize, labelOffset: 0 };
    }

    if (scaleType === "pow" && typeof value === "number" && minMaxIsNum) {
      const power = 2; // Adjust power as needed
      const normalized =
        (Math.pow(value, power) - Math.pow(min, power)) /
        (Math.pow(max, power) - Math.pow(min, power));

      return { coord: rangeMin + normalized * scaleSize, labelOffset: 0 };
    }
  }

  if (scaleType === "band" || scaleType === "point") {
    const step = scaleSize / ticks.length;

    const tickIndex = ticks.findIndex(
      ({ value: tickValue }) => tickValue === value,
    );

    const labelOffset =
      tickLabelPlacement === "tick"
        ? 0
        : step * (offsetRatio[tickLabelPlacement] - offsetRatio[tickPlacement]);

    if (tickIndex === -1) {
      const normalized =
        ((value as number) - Math.min(...ticks.map((p) => p.value as number))) /
        Math.ceil(
          Math.max(...ticks.map((p) => p.value as number)) -
            Math.min(...ticks.map((p) => p.value as number)),
        );

      const scaledValue = rangeMin + normalized * scaleSize;

      return {
        coord:
          axis === "x"
            ? scaledValue
            : rangeMax - (scaledValue - rangeMin) - step,
        labelOffset,
        bandWidth: step,
      };
    }

    const scaledValue = rangeMin + tickIndex * step;

    return {
      coord:
        axis === "x" ? scaledValue : rangeMax - (scaledValue - rangeMin) - step,
      labelOffset,
      bandWidth: step,
    };
  }

  if (scaleType === "time" || scaleType === "utc") {
    const { min, max } = getMinMax(ticks.map(({ value }) => value as Date));

    const normalized =
      (new Date(value).getTime() - min.getTime()) /
      (max.getTime() - min.getTime());

    return { coord: rangeMin + normalized * scaleSize, labelOffset: 0 };
  }

  return { coord: rangeMin, labelOffset: 0 };
};

export const generatePath = (
  points: { x: number; y: number }[],
  interpolation:
    | "catmullRom"
    | "linear"
    | "monotoneX"
    | "monotoneY"
    | "natural"
    | "step"
    | "stepBefore"
    | "stepAfter",
): string => {
  if (interpolation === "linear") {
    return points
      .map((point, i) =>
        i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`,
      )
      .join(" ");
  }

  if (interpolation === "catmullRom") {
    return calculateCatmullRomPath(points, 0.5);
  }

  if (interpolation === "monotoneX" || interpolation === "monotoneY") {
    // Uses d3-style interpolation logic; you can implement a manual version or leverage d3
    return calculateMonotonePath(points, interpolation === "monotoneY");
  }

  if (interpolation === "natural") {
    return calculateNaturalSpline(points);
  }

  if (interpolation === "step") {
    return points.reduce(
      (path, point, i) =>
        i === 0 ? `M${point.x},${point.y}` : `${path} H${point.x} V${point.y}`,
      "",
    );
  }

  if (interpolation === "stepBefore") {
    return points.reduce(
      (path, point, i, arr) =>
        i === 0
          ? `M${point.x},${point.y}`
          : `${path} V${arr[i - 1]?.y} H${point.x}`,
      "",
    );
  }

  if (interpolation === "stepAfter") {
    return points.reduce(
      (path, point, i) =>
        i === 0 ? `M${point.x},${point.y}` : `${path} H${point.x} V${point.y}`,
      "",
    );
  }

  return points
    .map((point, i) =>
      i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`,
    )
    .join(" ");
};

const calculateMonotonePath = (
  points: { x: number; y: number }[],
  isY: boolean = false,
): string => {
  if (points.length < 2) return "";

  const path: string[] = [`M${points[0]?.x},${points[0]?.y}`];
  const n = points.length;

  // Calculate tangents
  const tangents: { x: number; y: number }[] = new Array(n).fill({
    x: 0,
    y: 0,
  });

  for (let i = 1; i < n - 1; i++) {
    const p0 = points[i - 1]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    // const dx = p2.x - p0.x;
    const dy = p2.y - p0.y;

    const slope = isY ? dy / (p1.y - p0.y || 1e-6) : dy / (p1.x - p0.x || 1e-6);
    tangents[i] = { x: slope, y: slope };
  }

  // Adjust first and last tangent
  const [point0, point1] = points;
  tangents[0] = {
    x: (point1!.x - point0!.x) / 2,
    y: (point1!.y - point0!.y) / 2,
  };
  tangents[n - 1] = {
    x: (points[n - 1]!.x - points[n - 2]!.x) / 2,
    y: (points[n - 1]!.y - points[n - 2]!.y) / 2,
  };

  // Build the cubic Bezier path
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const t0 = tangents[i]!;
    const t1 = tangents[i + 1]!;

    const cp1x = p0.x + t0.x / 3;
    const cp1y = p0.y + t0.y / 3;
    const cp2x = p1.x - t1.x / 3;
    const cp2y = p1.y - t1.y / 3;

    path.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`);
  }

  return path.join(" ");
};

const calculateNaturalSpline = (points: { x: number; y: number }[]): string => {
  if (!points.length) return "";

  const paths = [`M${points[0]?.x},${points[0]?.y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const cp1X = p0.x + (p1.x - p0.x) / 2;
    const cp1Y = p0.y;
    const cp2X = p1.x - (p1.x - p0.x) / 2;
    const cp2Y = p1.y;

    paths.push(`C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${p1.x},${p1.y}`);
  }

  return paths.join(" ");
};

const calculateCatmullRomPath = (
  points: { x: number; y: number }[],
  tension: number = 0.5,
): string => {
  if (points.length < 2) return "";

  const path: string[] = [`M${points[0]?.x},${points[0]?.y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]!; // Previous point or duplicate first
    const p1 = points[i]!; // Current point
    const p2 = points[i + 1] || points[i]!; // Next point or duplicate last
    const p3 = points[i + 2] || p2!; // Point after next or duplicate last

    // Calculate control points for the spline
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    // Add cubic Bezier curve to the path
    path.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }

  return path.join(" ");
};

export const getMinMax = <T extends string | number | Date>(
  data: T[],
): { min: T; max: T } => {
  if (!data || data.length === 0) {
    return { min: 0 as T, max: 0 as T };
  }

  let min = data[0] || (0 as T);
  let max = data[0] || (0 as T);

  for (const item of data) {
    if (item < min) {
      min = item;
    }
    if (item > max) {
      max = item;
    }
  }

  return { min, max };
};

export const createBandScale = (
  domain: (string | number)[],
  range: [number, number],
): BandScale => {
  const [start, end] = range;
  const step = (end - start) / domain.length;
  const bandwidth = step * 0.8; // padding built-in

  const map = new Map(domain.map((d, i) => [d, i]));

  const scale = ((v: string | number) => {
    const i = map.get(v) ?? 0;
    return start + i * step + (step - bandwidth) / 2;
  }) as BandScale;

  scale.bandwidth = bandwidth;
  scale.step = step;

  return scale;
};

export const createLinearScale = (
  domain: [number, number],
  range: [number, number],
): ContinuousScale => {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  return (v: number | Date) =>
    r0 + (((v instanceof Date ? v.getTime() : v) - d0) / (d1 - d0)) * (r1 - r0);
};
