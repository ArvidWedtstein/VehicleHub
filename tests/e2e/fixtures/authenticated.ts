import { test as base, Page } from "@playwright/test";
import { getTestSession } from "../../auth";

const CHUNK_SIZE = 3180;

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    const session = await getTestSession();

    console.log("Authenticated session:", session);

    const storageKey = `sb-${new URL(process.env.SUPABASE_URL!).hostname.split(".")[0]}-auth-token`;
    const sessionValue = JSON.stringify(session);
    const domain = new URL(
      process.env.NUXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    ).hostname;

    const chunks = Math.ceil(sessionValue.length / CHUNK_SIZE);

    if (chunks === 1) {
      await page.context().addCookies([
        {
          name: storageKey,
          value: sessionValue,
          domain,
          path: "/",
        },
      ]);
    } else {
      const cookies = Array.from({ length: chunks }, (_, i) => ({
        name: `${storageKey}.${i}`,
        value: sessionValue.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        domain,
        path: "/",
      }));
      await page.context().addCookies(cookies);
    }

    await use(page);
  },
});
