<script setup lang="ts">
import { computed } from "vue";

type Props = {
  drivetrain?: "AWD" | "FWD" | "RWD";
};

const props = withDefaults(defineProps<Props>(), {
  drivetrain: "FWD",
});

const axlePath =
  "M5 4.75 C4.58579 4.75 4.25 5.08579 4.25 5.5C4.25 5.91421 4.58579 6.25 5 6.25L5 4.75ZM19 6.25C19.4142 6.25 19.75 5.91422 19.75 5.5C19.75 5.08579 19.4142 4.75 19 4.75L19 6.25ZM12 4.75L5 4.75L5 6.25L12 6.25L12 4.75ZM12 6.25L19 6.25L19 4.75L12 4.75L12 6.25Z";
const wheelPath =
  "M4 8.25 L2 8.25 L2 9.75L4 9.75 L4 8.25 Z M1.75 8 L1.75 3 L0.250001 3 L0.25 8 L1.75 8 Z M2 2.75 L4 2.75 L4 1.25 L2 1.25 L2 2.75 Z M4.25 3 L4.25 8L5.75 8L5.75 3L4.25 3ZM4 2.75C4.13807 2.75 4.25 2.86193 4.25 3L5.75 3C5.75 2.0335 4.9665 1.25 4 1.25L4 2.75ZM1.75 3C1.75 2.86193 1.86193 2.75 2 2.75L2 1.25C1.0335 1.25 0.250001 2.0335 0.250001 3L1.75 3ZM2 8.25C1.86193 8.25 1.75 8.13807 1.75 8L0.25 8C0.25 8.9665 1.0335 9.75 2 9.75L2 8.25ZM4 9.75C4.9665 9.75 5.75 8.9665 5.75 8L4.25 8C4.25 8.13807 4.13807 8.25 4 8.25L4 9.75Z";

const wheelActivePath = "M1.75 2.75 L1.75 8.25 L4.5 8.25 L4.5 2.75 Z";

const paths = computed(() => {
  let wheelPaths = [
    transformPathCoordinates(wheelPath, 0, 0), // Front Left
    transformPathCoordinates(wheelPath, 18, 0), // Front Right
    transformPathCoordinates(wheelPath, 0, 14), // Rear Left
    transformPathCoordinates(wheelPath, 18, 14), // Rear Right
  ];
  const axlePaths = [
    transformPathCoordinates(axlePath, 0, 0),
    transformPathCoordinates(axlePath, 0, 14),
  ];

  switch (props.drivetrain) {
    case "FWD":
      wheelPaths[0] += transformPathCoordinates(wheelActivePath, 0, 0);
      wheelPaths[1] += transformPathCoordinates(wheelActivePath, 18, 0);
      break;
    case "RWD":
      wheelPaths[2] += transformPathCoordinates(wheelActivePath, 0, 14);
      wheelPaths[3] += transformPathCoordinates(wheelActivePath, 18, 14);
      break;
    default:
      wheelPaths = wheelPaths.map((path, index) => {
        return (path += transformPathCoordinates(
          wheelActivePath,
          index % 2 === 0 ? 0 : 18,
          index > 1 ? 14 : 0
        ));
      });
      break;
  }

  return {
    wheelPaths: wheelPaths.join("\n"),
    axlePaths: axlePaths.join("\n"),
  };
});
</script>

<template>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 3.75C14.4142 3.75 14.75 3.41421 14.75 3C14.75 2.58579 14.4142 2.25 14 2.25L14 3.75ZM10 2.25C9.58579 2.25 9.25 2.58579 9.25 3C9.25 3.41421 9.58579 3.75 10 3.75L10 2.25ZM14 2.25L10 2.25L10 3.75L14 3.75L14 2.25Z"
    />

    <path :d="paths.wheelPaths" />

    <path :d="paths.axlePaths" />
  </svg>
</template>
