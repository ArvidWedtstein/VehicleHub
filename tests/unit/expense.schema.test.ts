import { describe, expect, it } from "vitest";
import { expenseFormSchema } from "#shared/schemas/expense";

describe("expenseFormSchema", () => {
  it("fails when amount is missing", () => {
    const result = expenseFormSchema.safeParse({ amount: null, cost: 1000 });
    console.log("result", result);
    expect(result.success).toBe(false);
  });
});

describe("expenseUpdateSchema", () => {
  it("passes with partial data", () => {
    const result = expenseFormSchema.safeParse({ cost: 1000 });
    console.log("result", result);
    expect(result.success).toBe(true);
  });
});
