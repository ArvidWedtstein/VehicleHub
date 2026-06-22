import { expect, test } from "@playwright/test";

test.describe("Home page", async () => {
  test("renders the home page", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).toContain("Welcome");
  });
});
