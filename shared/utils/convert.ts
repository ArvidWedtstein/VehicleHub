import { z } from "zod";

export const jsonToCsv = (data: Record<string, unknown>[]) => {
  if (!data.length) return "";
  const headers = Object.keys(data[0] || {});
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};

export const convertToDatetimeLocal = (
  inputDate: number | string | Date = new Date(),
): string => {
  const date = new Date(inputDate);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
