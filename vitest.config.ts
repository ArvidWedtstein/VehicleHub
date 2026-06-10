// vitest.config.ts
import { defineConfig } from "vitest/config";
import {
  defineVitestProject,
  defineVitestConfig,
} from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
  },
});
// export default defineConfig({
//   test: {
//     projects: [
//       {
//         test: {
//           name: "unit",
//           include: ["tests/unit/**/*.{test,spec}.ts"],
//           environment: "node",
//         },
//       },

//       {
//         test: {
//           name: "e2e",
//           include: ["tests/e2e/**/*.{test,spec}.ts"],
//           environment: "node",
//         },
//       },

//       defineVitestProject({
//         test: {
//           name: "nuxt",
//           include: ["tests/nuxt/**/*.{test,spec}.ts"],
//           environment: "nuxt",
//         },
//       }),
//     ],
//   },
// });
