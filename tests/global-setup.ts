import { chromium, FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  const projectRef = "akhxphgocxpyoofvdqwi";
  const cookieName = `sb-${projectRef}-auth-token`;
  const domain = new URL(baseURL!).hostname;

  const fakeUser = {
    id: "test-user-id-playwright",
    aud: "authenticated",
    role: "authenticated",
    email: "playwright@test.com",
    app_metadata: { provider: "google", providers: ["google"] },
    user_metadata: {
      full_name: "Playwright User",
      avatar_url: "https://via.placeholder.com/150",
      email: "playwright@test.com",
    },
    created_at: new Date().toISOString(),
  };

  const fakeSession = JSON.stringify({
    access_token: "fake-access-token",
    refresh_token: "fake-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user: fakeUser,
  });

  // @nuxtjs/supabase splits the cookie at 3600 chars
  const CHUNK_SIZE = 3600;
  const chunks = fakeSession.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) ?? [];

  const cookieBase = {
    domain,
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  };

  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Set each chunk as its own numbered cookie — mirrors exactly what the module does
  await context.addCookies(
    chunks.map((chunk, i) => ({
      ...cookieBase,
      name: `${cookieName}.${i}`,
      value: chunk,
    })),
  );

  // Also write localStorage for the client-side Supabase JS client
  const page = await context.newPage();
  await page.goto(baseURL!);
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, session),
    { key: cookieName, session: fakeSession },
  );

  await context.storageState({ path: "tests/.auth/user.json" });
  await browser.close();
}
