import { expect, test } from "vitest";
import { convertBytes } from "../../app/utils/format";

test("converts bytes to kilobytes", () => {
  expect(convertBytes(1024, "bytes", "kilobytes")).toBe(1);
});
