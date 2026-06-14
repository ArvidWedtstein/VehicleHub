// @ts-check
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll } from "vitest";
import { setup, createPage, useTestContext } from "@nuxt/test-utils/e2e";

describe("Expense Dialog", () => {
  beforeAll(async () => {
    await setup({
      rootDir: fileURLToPath(new URL("../../", import.meta.url)),
      browser: true,
      server: true,
      // browserOptions: {
      //   type: 'firefox', // Options: 'chromium', 'firefox', or 'webkit'
      //   launch: {
      //     headless: false,
      //     slowMo: 500,
      //   }
      // }
    });
    console.log("SETUP DONE");
  }, 60000);

  it("renders the home page", async () => {
    console.log("CREATE PAGE");

    const page = await createPage("/", { waitUntil: "hydration" });
    console.log("PAGE DONE");
    const html = await page.content();
    expect(html).toContain("Welcome");
  });

  // it("creates an expense", async () => {
  //   const page = await createPage("/vehicles/1/expenses");
  //   expect(page).toBeTruthy();

  //   const addExpenseButton = page.getByTestId("add-expense").first();
  //   expect(addExpenseButton).toBeVisible();

  //   await addExpenseButton.click();

  //   await expect(
  //     page.getByRole("dialog", { name: "Add Expense" }),
  //   ).toBeVisible();

  //   await page.getByLabel("Amount").fill("100");
  //   await page.getByLabel("Description").fill("Oil Change");

  //   await page.getByRole("button", { name: "Create" }).click();

  //   await expect(page.getByText("Successfully created expense")).toBeVisible();

  //   await expect(
  //     page.getByRole("dialog", { name: "Add Expense" }),
  //   ).toBeHidden();
  // });
});
