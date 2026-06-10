import { setup } from "@nuxt/test-utils/e2e";
import { describe, it, test, expect } from "vitest";

describe("Vehicle Hub App", async () => {
  await setup();

  test("renders the home page", async () => {
    const html = await $fetch("/");
    expect(html).toContain("Hei");
  });
});
