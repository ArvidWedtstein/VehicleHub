import { expect } from "@playwright/test";
import { test } from "./fixtures/authenticated";

test.describe("Expense Dialog", () => {
  const testUsersVehicleId = 9;
  test("creates an expense", async ({ authenticatedPage: page }) => {
    await page.goto(`/vehicles/${testUsersVehicleId}/expenses`, {
      waitUntil: "networkidle",
    });
    await expect(page).toHaveTitle(/Expenses/);

    const addExpenseButton = page.getByTestId("add-expense");
    await expect(addExpenseButton).toBeVisible();
    await expect(addExpenseButton).toBeEnabled();

    await addExpenseButton.click({ button: "left" });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("vehicle-expense-form")).toBeVisible();

    await dialog.getByLabel("Amount").fill("100");
    await dialog.getByLabel("Cost").fill("1000");

    await page.screenshot({ path: "test-results/after-form.png" });

    const submitButton = dialog.getByRole("button", { name: "Create" });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(page.getByText("Successfully created expense")).toBeVisible();

    await expect(dialog).toBeHidden();
  });
});
