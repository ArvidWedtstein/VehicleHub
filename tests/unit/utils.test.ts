import { expect, test, vi } from "vitest";
import { convertBytes } from "~/utils/format";

// vi.mock("~/composables/useLocale", () => ({
//   useLocale: () => ({
//     value: "nb",
//   }),
// }));

test("converts bytes to kilobytes", () => {
  expect(convertBytes(1024, "bytes", "kilobytes")).toBe(1);
});
