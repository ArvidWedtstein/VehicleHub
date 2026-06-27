import { expect } from "@playwright/test";
import { test } from "./fixtures/authenticated";

test.describe("Expense Dialog", () => {
  test("creates an expense", async ({ authenticatedPage: page }) => {
    await page.goto("/vehicles/1/expenses");
    await expect(page).toHaveTitle(/Expenses/);

    const addExpenseButton = page.getByTestId("add-expense");
    await expect(addExpenseButton).toBeVisible();

    await addExpenseButton.click();

    await expect(page.getByTestId("vehicle-expense-form")).toBeVisible();

    await page.getByLabel("Amount").fill("100");
    await page.getByLabel("Cost").fill("1000");

    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByText("Successfully created expense")).toBeVisible();

    await expect(
      page.getByRole("dialog", { name: "Add Expense" }),
    ).toBeHidden();
  });
});
