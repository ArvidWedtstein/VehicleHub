import {
  toCalendarDateTime,
  parseAbsolute,
  getLocalTimeZone,
} from "@internationalized/date";
import z from "zod";

export const timestamptzCodec = z.codec(
  z.iso.datetime({ offset: true }),
  z.iso.datetime({ offset: true, local: true }),
  {
    decode: (str) => parseAbsolute(str, getLocalTimeZone()).toString(),
    encode: (date) => date,
  },
);
