import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    testTimeout: 30000,
    globals: true,
    projects: [
      // {
      //   test: {
      //     name: "unit",
      //     include: ["tests/unit/*.{test,spec}.ts"],
      //     environment: "node",
      //   },
      // },
      await defineVitestProject({
        test: {
          name: "e2e",
          include: ["tests/e2e/**/*.e2e.{test,spec}.ts"],
          environment: "nuxt",
        },
      }),
      // await defineVitestProject({
      //   test: {
      //     name: "nuxt",
      //     include: ["tests/nuxt/*.{test,spec}.ts"],
      //     environment: "nuxt",
      //   },
      // }),
    ],
    pool: "forks",
    maxWorkers: 1,
    isolate: false,
    //exclude: ["tests/e2e/**", "**/playwright.config.*"],
  },
  server: {
    deps: {
      external: ["bun:test", "bun"],
    },
  },
});
