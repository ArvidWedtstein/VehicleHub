import z from "zod";
import { serverSupabaseServiceRole } from "#supabase/server";

const rowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  base: z.string(),
  quote: z.string(),
  rate: z.number().positive(),
});
const responseSchema = z.array(rowSchema);

const querySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (
    getHeader(event, "authorization")?.trim() !==
    `Bearer ${config.cronSecret?.trim()}`
  ) {
    throw createError({
      statusCode: 401,
      message: "Cron Secret did not match",
    });
  }

  const { from } = await getValidatedQuery(event, querySchema.parse);

  const now = new Date();
  const start = from
    ? new Date(`${from}T00:00:00Z`)
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  const db = serverSupabaseServiceRole(event);
  let total = 0;

  for (let cursor = start; cursor <= now; ) {
    const chunkEnd = new Date(
      Math.min(
        Date.UTC(cursor.getUTCFullYear() + 1, 0, 1) - 86_400_000,
        now.getTime(),
      ),
    );

    const raw = await $fetch(
      "https://api.frankfurter.dev/v2/providers/ecb/rates",
      {
        query: { base: "EUR", from: iso(cursor), to: iso(chunkEnd) },
        headers: { "User-Agent": "VehiclesHub/1.0" },
        timeout: 20000,
      },
    );

    const rows = responseSchema
      .parse(raw)
      .filter(
        (r) =>
          r.base === "EUR" && r.date >= iso(cursor) && r.date <= iso(chunkEnd),
      )
      .map((r) => ({
        day: r.date,
        currency: r.quote,
        per_eur: r.rate,
      }));

    for (let i = 0; i < rows.length; i += 1000) {
      const { error } = await db
        .from("exchange_rates")
        .upsert(rows.slice(i, i + 1000));
      if (error)
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
    total += rows.length;

    cursor = new Date(chunkEnd.getTime() + 86_400_000);
  }
  return { from: iso(start), count: total };
});
