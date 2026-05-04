<script
  setup
  lang="ts"
  generic="
    Dataset extends Record<string, unknown>,
    ScaleType extends ScaleTypes
  "
>
type Serie<T> = {
  data?: number[];
  /** Gets value from dataset */
  dataKey?: keyof T;

  label?: string;
  /** Color of serie line */
  color?: string;
  /** Baseline for area. Default is min */
  baseline?: "min" | "max";

  showMark?: (value: T[keyof T], index: number) => boolean;

  /** TODO: Formats value for tooltip */
  valueFormatter?: (value: T[keyof T]) => string;
};

type Scale = (v: number | string | Date, i?: number) => number;

type AxisDataType<S extends ScaleTypes> = S extends "linear" | "log" | "sqrt"
  ? number[]
  : S extends "time" | "utc"
    ? Date[]
    : S extends "band" | "point"
      ? (string | number)[]
      : number[];

type Axis<T, S extends ScaleTypes> = {
  data?: AxisDataType<S>;
  dataKey?: keyof T;
  scaleType?: S;

  position?: "top" | "bottom" | "left" | "right";

  /** TODO: fix type */
  valueFormatter?: (
    value:
      | T[keyof T]
      | (AxisDataType<S>[number] extends never
          ? number
          : AxisDataType<S>[number]),
  ) => string;
};

type Props<T> = {
  dataset?: T[];
  series: Serie<T>[];
  width?: number;
  height?: number;
  xAxis?: Axis<T, ScaleType>[];
  yAxis?: Axis<T, ScaleType>[];
  yTicks?: number[];
  smooth?: boolean;
  animate?: boolean;
  grid?: {
    vertical?: boolean;
    horizontal?: boolean;
  };
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  hidePoints?: boolean;
};

const props = withDefaults(defineProps<Props<Dataset>>(), {
  xAxis: () => [{ position: "bottom", scaleType: "linear" as ScaleType }],
  yAxis: () => [
    {
      position: "left",
      scaleType: "linear" as ScaleType,
    },
  ],
  grid: () => ({
    vertical: false,
    horizontal: false,
  }),
  margin: () => ({
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  }),
  hidePoints: false,
  width: 500,
  height: 300,
});

const chartBounds = computed(() => {
  const defaultMargins = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  const { top, bottom, left, right } = Object.assign(
    defaultMargins,
    props.margin,
  );

  return {
    top: top,
    bottom: props.height - bottom,
    left: left,
    right: props.width - right,
    width: props.width - left - right,
    height: props.height - left - right,
  };
});

function createBandScale(
  domain: (string | number)[],
  range: [number, number],
  padding = 0.1,
) {
  const step = (range[1] - range[0]) / domain.length;
  const band = step * (1 - padding);
  const offset = (step - band) / 2;

  const map = new Map(domain.map((d, i) => [d, i]));

  const scale: Scale = (v) => range[0] + map.get(v as any)! * step + offset;

  (scale as any).bandwidth = band;

  return scale as Scale & { bandwidth: number };
}

function createLinearScale(
  domain: [number, number],
  range: [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0);
  return (v) => r0 + (+v - d0) * m;
}

const seriesData = computed(() => {
  const colors = generateDistinctColors(props.series.length);

  return props.series.map((serie, index) => {
    /**
     * ! TODO: fix type
     */
    let data: number[] = serie.data || [];

    if (serie.dataKey && props.dataset && props.dataset?.length) {
      data = props.dataset.map(
        (p) =>
          getNestedProperty(p, [serie.dataKey?.toString() || ""]) as number,
      );
    }

    // TODO: fix.
    const serieColor =
      serie.color?.startsWith("--") && document
        ? getComputedStyle(document.documentElement).getPropertyValue(
            serie.color,
          )
        : serie.color;

    return {
      ...serie,
      data,
      baseline: serie.baseline ?? "min",
      color: serieColor || colors[index],
    };
  });
});

const formatTick = (
  value: string | number | Date,
  axis: Axis<Dataset, ScaleType>,
) => {
  if (axis.valueFormatter) {
    return axis.valueFormatter(value as Dataset[keyof Dataset]);
  }

  if (axis.scaleType === "time" || axis.scaleType === "utc") {
    return new Date(value).toISOString().split("T")[0];
  }

  if (value === undefined) return "";

  return value.toString();
};

const xAxes = computed(() => {
  const { bottom } = chartBounds.value;

  const xAxesWithData = props.xAxis.map((axis) => {
    const { scaleType = "linear" as ScaleType, dataKey, data: axisData } = axis;
    let data = (axisData || []) as AxisDataType<ScaleType>;

    if (dataKey && props.dataset) {
      data = props.dataset.map((p) =>
        getNestedProperty(p, [dataKey?.toString() || ""]),
      ) as AxisDataType<ScaleType>;
    }

    const steps = data.length;

    const maxSeriesLength = Math.max(
      ...seriesData.value.map((serie) => serie.data.length - 1),
    );

    const { min, max } = getMinMax(
      (data.length > 0 ? data : [0, maxSeriesLength]) as (
        | string
        | number
        | Date
      )[],
    );

    const axisTicks = generateAxisTicks(
      "x",
      min,
      max,
      scaleType,
      chartBounds.value,
      steps,
      data,
      "extremities",
      scaleType === "band" ? "middle" : "tick",
    );

    const ticksPosition = axisTicks.map(
      ({ coord, label, value, index, tickX, tickY, labelX, labelY }) => {
        return {
          index,
          label,
          value,
          x: coord,
          y: 0,
          tickX,
          tickY,
          labelX,
          labelY,
        };
      },
    );

    // TODO: fix position
    const position = {
      x: 0,
      y: bottom,
    };

    return {
      ...axis,
      scaleType,
      data,
      ...position,
      ticks: ticksPosition,
    };
  });

  return xAxesWithData;
});

const yAxes = computed(() => {
  const { left } = chartBounds.value;

  const yAxesWithData = props.yAxis.map((axis) => {
    const { scaleType = "linear" as ScaleType, dataKey, data: axisData } = axis;
    let data = (axisData || []) as AxisDataType<ScaleType>;

    if (dataKey && props.dataset) {
      data = props.dataset.map((p) =>
        getNestedProperty(p, [dataKey?.toString() || ""]),
      ) as AxisDataType<ScaleType>;
    }

    const seriesFlat = seriesData.value.flatMap(({ data }) => data);
    const steps = data.length;

    const { min, max } = getMinMax(
      (data.length > 0 ? data : seriesFlat) as (string | number | Date)[],
    );

    const axisTicks = generateAxisTicks(
      "y",
      min || 0,
      max,
      scaleType,
      chartBounds.value,
      steps,
      data,
      "extremities",
      scaleType === "band" ? "middle" : "tick",
    );

    // console.log('y', axisTicks, min, max, data);
    const ticksPosition = axisTicks.map(
      ({ coord, label, value, index, tickX, tickY, labelX, labelY }) => {
        // const { labelOffset } = scale(
        //   value,
        //   'y',
        //   scaleType,
        //   ticks,
        //   chartBounds.value,
        //   'extremities',
        //   scaleType === 'band' ? 'middle' : 'tick',
        // );

        return {
          index,
          label,
          value,
          x: 0,
          y: coord,
          tickX,
          tickY,
          labelX,
          labelY,
        };
      },
    );

    // TODO: fix position
    const position = {
      x: left,
      y: 0,
    };

    return {
      ...axis,
      scaleType,
      data,
      ...position,
      ticks: ticksPosition,
    };
  });

  return yAxesWithData;
});

const seriesDataPoints = computed(() => {
  const { bottom, left } = chartBounds.value;

  const series = seriesData.value.map((serie, serieIndex) => {
    const xAxis =
      xAxes.value[serieIndex > xAxes.value.length - 1 ? 0 : serieIndex]!;
    const yAxis =
      yAxes.value[serieIndex > yAxes.value.length - 1 ? 0 : serieIndex]!;

    const points = serie.data
      .map((value, index) => {
        if (value === null || value === undefined) return undefined;

        // TODO: replace, xPos can't be determined based on ticks position...
        const xPos = xAxis.ticks.find(
          ({ index: tickIndex, value: tickValue, label }) => {
            const xDataVal =
              xAxis.data[index] instanceof Date
                ? xAxis.data[index].getTime()
                : xAxis.data[index];

            return xAxis.data.length > 0
              ? xDataVal === label || xDataVal === tickValue
              : tickIndex === index;
          },
        );

        const { min: xMin, max: xMax } = getMinMax(
          xAxis.ticks.map((p) => p.label).filter((p) => p != null),
        );

        const x = numberToChart(
          xMin,
          xMax,
          xPos?.value || xAxis.ticks[index]?.value || 0,
          "x",
          xAxis.scaleType,
          chartBounds.value,
        );

        const { min: yMin, max: yMax } = getMinMax(
          yAxis.ticks.map((p) => p.label).filter((p) => p != null),
        );

        const y = numberToChart(
          yMin,
          yMax,
          value,
          "y",
          yAxis.scaleType,
          chartBounds.value,
        );

        const showMark =
          serie.showMark?.(value as Dataset[keyof Dataset], index) ?? true;

        const width = xPos?.labelX || 0;
        const height = isFinite(bottom - y) ? bottom - y : 0;

        // TODO: fix width so it doesn't overlap with other bars
        const barX =
          xAxis.scaleType === "point" || xAxis.scaleType === "band"
            ? xPos
              ? (xPos?.x || left) + width / 2
              : x
            : x;

        return {
          x: barX,
          y: isFinite(y) ? y : 0,
          width,
          height,
          showMark,
        };
      })
      .filter((p) => p !== undefined);

    return {
      ...serie,
      points,
    };
  });

  return series;
});

type Tooltip = {
  nearestX?: number;
  visible: boolean;
  columnHover: boolean;
  x: number;
  y: number;
  content: string;
};

const tooltip = ref<Tooltip>({
  visible: false,
  columnHover: false,
  nearestX: 0,
  x: 0,
  y: 0,
  content: "",
});

const columnHoverPath = computed(() => {
  const { bottom, top } = chartBounds.value;
  const { x } = tooltip.value;

  const colWidth = 20;
  // return `M${left},${bottom} L${x},${y}Z`;
  return `M${x} ${top} l${colWidth} 0 l0 ${bottom} l${-colWidth} 0 Z`;
});
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="relative w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    @mousemove="
      (e) => {
        const { pageX, pageY } = e;
        const { left, top } = chartBounds;
        tooltip.x = pageX - left;
        tooltip.y = pageY - top;

        tooltip.visible = true;

        console.log('tooltip', tooltip.x, tooltip.y);
      }
    "
    @mouseleave="tooltip.visible = false"
  >
    <title></title>
    <desc></desc>
    <defs></defs>
    <g>
      <template v-if="grid?.vertical">
        <line
          v-for="({ x }, index) in xAxes[0]?.ticks"
          :key="`grid-vertical-line-${index}`"
          :y1="chartBounds.top"
          :y2="chartBounds.bottom"
          :x1="x"
          :x2="x"
          class="stroke-white/10 stroke-1"
        />
      </template>
      <template v-if="grid?.horizontal">
        <line
          v-for="({ y }, index) in yAxes[0]?.ticks"
          :key="`grid-horizontal-line-${index}`"
          :y1="y"
          :y2="y"
          :x1="chartBounds.left"
          :x2="chartBounds.right"
          class="stroke-white/10 stroke-1"
        />
      </template>
    </g>
    <g>
      <g
        v-for="({ color, points }, serieIndex) in seriesDataPoints"
        :key="`serie-${serieIndex}-points`"
      >
        <rect
          v-for="({ x, y, width, height }, index) in points.filter(
            ({ showMark }) => showMark,
          )"
          :key="`serie-${serieIndex}-bar-${index}`"
          color="#495AFB"
          :x="x"
          :y="y"
          :width="width"
          :height="height"
          cursor="unset"
          stroke="none"
          :fill="color"
          layout="vertical"
          opacity="1"
        ></rect>
      </g>

      <!-- Tooltip element -->
      <path
        v-if="tooltip.columnHover"
        :d="columnHoverPath"
        class="fill-white/10"
      />
    </g>

    <g
      v-for="(axis, axisIndex) in xAxes"
      :key="`x-axis-${axisIndex}`"
      :transform="`translate(${axis.x}, ${axis.y})`"
    >
      <line
        :x1="chartBounds.left"
        :x2="chartBounds.right"
        class="stroke-white"
      />

      <g
        v-for="(
          { label, x, y, tickX, tickY, labelX, labelY }, index
        ) in axis.ticks"
        :key="`x-axis-${axisIndex}-ticks-${index}`"
        :transform="`translate(${x}, ${y})`"
      >
        <line :x1="tickX" :x2="tickX" :y2="tickY" class="stroke-white" />

        <text
          :x="labelX"
          :y="labelY"
          class="text-xs fill-white"
          text-anchor="middle"
          dominant-baseline="hanging"
        >
          <tspan :x="labelX" dy="0px" dominant-baseline="central">
            {{ formatTick(label as number | string | Date, axis) }}
          </tspan>
        </text>
      </g>
    </g>
    <g
      v-for="(axis, axisIndex) in yAxes"
      :key="`y-axis-${axisIndex}`"
      :transform="`translate(${axis.x}, ${axis.y})`"
    >
      <line
        :y1="chartBounds.top"
        :y2="chartBounds.bottom"
        shape-rendering="auto"
        class="stroke-white"
        stroke-linecap="square"
      />

      <g
        v-for="(
          { label, x, y, tickX, tickY, labelX, labelY }, index
        ) in axis.ticks"
        :key="'y-tick-' + index"
        :transform="`translate(${x}, ${y})`"
      >
        <line :x2="tickX" :y2="tickY" class="stroke-white" />
        <text
          class="text-xs fill-white"
          :x="labelX"
          :y="labelY"
          text-anchor="end"
          dominant-baseline="central"
        >
          <tspan :x="labelX" dy="0px" dominant-baseline="central">
            {{ formatTick(label as number | string | Date, axis) }}
          </tspan>
        </text>
      </g>
    </g>

    <g v-if="tooltip.visible">
      <rect
        class="fill-red-500"
        width="100"
        height="50"
        rx="7"
        :x="tooltip.x"
        :y="tooltip.y"
      />
      <text
        :x="tooltip.x"
        :y="tooltip.y"
        class="text-xs fill-white"
        dominant-baseline="hanging"
      >
        <tspan
          dy="0px"
          dominant-baseline="hanging"
          v-html="tooltip.content"
        ></tspan>
      </text>
    </g>
    <clipPath id="some-clip-path">
      <rect
        :x="chartBounds.left"
        :y="chartBounds.top"
        :width="chartBounds.width"
        :height="chartBounds.height"
      />
    </clipPath>
  </svg>
</template>
