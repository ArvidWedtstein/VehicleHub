import { fileURLToPath } from "node:url";
import { describe, expect, it, test } from "vitest";
import { setup, $fetch, isDev } from "@nuxt/test-utils";

describe("Vehicle Hub App", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../../", import.meta.url)),
    server: true,
  });

  test("renders the home page", async () => {
    const html = await $fetch("/");
    expect(html).toContain("Welcome");
  });
});
