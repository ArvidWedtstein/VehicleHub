import { expect } from "@playwright/test";
import { test } from "./fixtures/authenticated";
import { supabaseAdmin } from "../auth";

test.describe("Expense Dialog", () => {
  const testUsersVehicleId = 9;

  const expenseCost = Date.now();

  test.afterEach(async () => {
    await supabaseAdmin
      .from("VehicleExpenses")
      .delete()
      .eq("vehicle_id", testUsersVehicleId)
      .eq("createdby_id", process.env.TEST_USER_ID)
      .gte("cost", expenseCost);
  });

  test("shows errors on empty submit", async ({ authenticatedPage: page }) => {
    await page.goto(`/vehicles/${testUsersVehicleId}/expenses`, {
      waitUntil: "networkidle",
    });
    await page.getByTestId("add-expense").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Create" }).click();

    await expect(dialog.getByText("Cost is required")).toBeVisible();

    await expect(dialog).toBeVisible();
  });

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
    await dialog.getByLabel("Cost").fill(expenseCost.toString());

    await page.screenshot({ path: "test-results/after-form.png" });

    const submitButton = dialog.getByRole("button", { name: "Create" });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(page.getByText("Successfully created expense")).toBeVisible();

    await expect(dialog).toBeHidden();
  });
});
