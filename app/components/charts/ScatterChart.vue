<script
  setup
  lang="ts"
  generic="
    Dataset extends Record<string, unknown>,
    ScaleType extends ScaleTypes
  "
>
type Serie<T> = {
  label?: string;
  data?: { id: string; x: number; y: number }[];
  /** Gets value from dataset */
  datasetKeys?: { id: keyof T; x: keyof T; y: keyof T };

  /** Color of serie line */
  color?: string;
  /** Baseline for area. Default is min */
  baseline?: "min" | "max";
};

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
          : AxisDataType<S>[number])
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
    props.margin
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

const seriesData = computed(() => {
  const colors = generateDistinctColors(props.series.length);

  return props.series.map((serie, index) => {
    /**
     * ! TODO: fix type
     */
    let data = serie.data || [];

    if (serie.datasetKeys && props.dataset && props.dataset?.length) {
      data = props.dataset.map((datasetEntry) => {
        const id = getNestedProperty(datasetEntry, [
          serie.datasetKeys?.id.toString() || "",
        ]) as string;
        const x = getNestedProperty(datasetEntry, [
          serie.datasetKeys?.x.toString() || "",
        ]) as number;
        const y = getNestedProperty(datasetEntry, [
          serie.datasetKeys?.y.toString() || "",
        ]) as number;

        return {
          id,
          x,
          y,
        };
      });
    }

    return {
      ...serie,
      data,
      baseline: serie.baseline ?? "min",
      color: serie.color || colors[index],
    };
  });
});

const formatTick = (
  value: string | number | Date,
  axis: Axis<Dataset, ScaleType>
) => {
  if (axis.valueFormatter) {
    return axis.valueFormatter(value as Dataset[keyof Dataset]);
  }

  if (axis.scaleType === "time" || axis.scaleType === "utc") {
    return new Date(value).toISOString().split("T")[0];
  }
  return parseInt(value.toString());
};

const xAxes = computed(() => {
  const { bottom } = chartBounds.value;

  const xAxesWithData = props.xAxis.map((axis) => {
    const { scaleType = "linear" as ScaleType, dataKey, data: axisData } = axis;
    let data = (axisData || []) as AxisDataType<ScaleType>;

    if (dataKey && props.dataset) {
      data = props.dataset.map((p) =>
        getNestedProperty(p, [dataKey?.toString() || ""])
      ) as AxisDataType<ScaleType>;
    }

    const seriesFlat = seriesData.value.flatMap(({ data }) => data);
    const steps = data.length > 0 ? data.length : seriesFlat.length;

    const { min, max } = getMinMax(
      (data.length > 0 ? data : seriesFlat.map((p) => p.x)) as (
        | string
        | number
        | Date
      )[]
    );

    const ticks = generateTicks(min, max, steps, scaleType, data);
    // const axisTicks = generateAxisTicks(
    //   'x',
    //   min,
    //   max,
    //   scaleType,
    //   chartBounds.value,
    //   steps,
    //   data.length > 0 ? data : seriesFlat.map(p => p.x),
    // );

    // console.log('x', ticks, axisTicks, min, max);
    const ticksPosition = ticks.map(({ value, index }) => {
      const { coord: scaleX, labelOffset } = scale(
        value as number & Date,
        "x",
        scaleType,
        ticks,
        chartBounds.value,
        "extremities",
        scaleType === "band" ? "middle" : "tick"
      );

      return {
        index,
        label: value,
        x: scaleX,
        y: 0,
        tickX: 0,
        tickY: 6,
        labelX: labelOffset,
        labelY: 9,
      };
    });

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
        getNestedProperty(p, [dataKey?.toString() || ""])
      ) as AxisDataType<ScaleType>;
    }

    const seriesFlat = seriesData.value.flatMap(({ data }) => data);
    const steps = data.length > 0 ? data.length : 5;

    const { min, max } = getMinMax(
      (data.length > 0 ? data : seriesFlat.map((p) => p.y)) as (
        | string
        | number
        | Date
      )[]
    );

    const ticks = generateTicks(min || 0, max, steps, scaleType, data);

    const ticksPosition = ticks.map(({ value, index }) => {
      const { coord: scaleY, labelOffset } = scale(
        value as number & Date,
        "y",
        scaleType,
        ticks,
        chartBounds.value,
        "extremities",
        scaleType === "band" ? "middle" : "tick"
      );

      return {
        index,
        label: value,
        x: 0,
        y: scaleY,
        tickX: -6,
        tickY: 0,
        labelX: -8,
        labelY: labelOffset,
      };
    });

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
  const series = seriesData.value.map((serie, serieIndex) => {
    const xAxis =
      xAxes.value[serieIndex > xAxes.value.length - 1 ? 0 : serieIndex]!;
    const yAxis =
      yAxes.value[serieIndex > yAxes.value.length - 1 ? 0 : serieIndex]!;

    const points = serie.data
      .map((value) => {
        if (
          value.x === undefined ||
          value.x === null ||
          value.y === undefined ||
          value.y === null
        )
          return undefined;

        const { min: xMin, max: xMax } = getMinMax(
          xAxis.ticks.map((p) => p.label)
        );

        const { min: yMin, max: yMax } = getMinMax(
          yAxis.ticks.map((p) => p.label)
        );

        const x = numberToChart(
          xMin,
          xMax,
          value.x,
          "x",
          xAxis.scaleType,
          chartBounds.value
        );

        const y = numberToChart(
          yMin,
          yMax,
          value.y,
          "y",
          yAxis.scaleType,
          chartBounds.value
        );

        if (x < chartBounds.value.left) {
          return undefined;
        }

        return {
          x,
          y,
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
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="relative w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
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
    <g data-drawing-container="true">
      <g v-if="!hidePoints">
        <g
          v-for="({ color, points }, serieIndex) in seriesDataPoints"
          :key="`serie-${serieIndex}-points`"
          :clip-path="`url(#auto-generated-id-${serieIndex}-line-clip)`"
        >
          <path
            v-for="({ x, y }, index) in points"
            :key="`serie-${serieIndex}-point-${index}`"
            :style="{
              transform: `translate(${x}px, ${y}px)`,
              'transform-origin': `${x}px ${y}px 0px`,
              stroke: color,
            }"
            class="stroke-2 fill-base-100"
            d="M4.514,0A4.514,4.514,0,1,1,-4.514,0A4.514,4.514,0,1,1,4.514,0"
            cursor="unset"
          />
        </g>
      </g>
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
