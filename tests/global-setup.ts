import { chromium, FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Hit your callback route with a fake code — the server plugin intercepts it,
  // skips the real exchangeCodeForSession, sets auth cookies, and redirects home
  await page.goto(`${baseURL}/api/auth/callback?code=fake-code-playwright`);

  // Wait for the post-login redirect to settle
  await page.waitForURL((url) => !url.pathname.includes("callback"), {
    timeout: 10_000,
  });

  // Save cookies + localStorage so every test starts authenticated
  await page.context().storageState({ path: "tests/.auth/user.json" });
  await browser.close();
}
