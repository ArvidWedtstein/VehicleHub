import { test as base, expect } from "@playwright/test";

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

export const test = base.extend({
  page: async ({ page }, use) => {
    // Session validation
    await page.route("**/auth/v1/user", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(fakeUser),
      }),
    );

    // Token refresh
    await page.route("**/auth/v1/token*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "fake-access-token",
          refresh_token: "fake-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: fakeUser,
        }),
      }),
    );

    await use(page);
  },
});

export { expect };
