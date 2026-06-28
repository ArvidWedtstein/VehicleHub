import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/*.{test,spec}.ts"],
          environment: "node",
        },
        resolve: {
          alias: {
            "#shared": resolve(__dirname, "shared"),
          },
        },
      },
      // {
      //   test: {
      //     name: "e2e",
      //     include: ["tests/e2e/**/*.e2e.{test,spec}.ts"],
      //     environment: "node",
      //   },
      // },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["tests/nuxt/*.{test,spec}.ts"],
          environment: "nuxt",
        },
        resolve: {
          alias: {
            "#shared": resolve(__dirname, "shared"),
          },
        },
      }),
    ],
    exclude: ["tests/e2e/**", "**/playwright.config.*"],
  },
});
