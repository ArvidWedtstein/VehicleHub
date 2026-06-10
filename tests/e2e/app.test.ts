import { setup, createPage, $fetch, url } from "@nuxt/test-utils/e2e";
import { describe, it, test, expect } from "vitest";
import {
  test as playwrightTest,
  expect as playwrightExpect,
} from "@nuxt/test-utils/playwright";

describe("Vehicle Hub App", async () => {
  await setup();

  test("renders the home page", async () => {
    const html = await $fetch("/");
    expect(html).toContain("Hei");
  });

  test("with playwright", async () => {
    const page = await createPage();
    await page.goto(url("/"), { waitUntil: "hydration" });
  });

  playwrightTest("test", async ({ page, goto }) => {
    await goto("/", { waitUntil: "hydration" });
    await playwrightExpect(page.getByRole("heading")).toHaveText("Vehicle");
  });
});
