import { expect, test } from "@nuxt/test-utils/playwright";
import { describe } from "vitest";
import { setup, createPage } from "@nuxt/test-utils/e2e";

test("creates an expense", async () => {
  await setup();
  const page = await createPage("/vehicles/1/expenses");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("dialog", { name: "Add Expense" })).toBeVisible();

  await page.getByLabel("Amount").fill("100");
  await page.getByLabel("Description").fill("Oil Change");

  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Successfully created expense")).toBeVisible();

  await expect(page.getByRole("dialog", { name: "Add Expense" })).toBeHidden();
});
