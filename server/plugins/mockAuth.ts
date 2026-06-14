export default defineNitroPlugin((nitroApp) => {
  if (process.env.PLAYWRIGHT !== "true") return;

  nitroApp.hooks.hook("request", async (event) => {
    const url = getRequestURL(event);

    // Intercept the OAuth callback before your real handler runs
    if (url.pathname === "/api/auth/callback" && url.searchParams.has("code")) {
      const projectRef = process.env.SUPABASE_URL
        ? new URL(process.env.SUPABASE_URL).hostname.split(".")[0]
        : "local";

      const fakeAccessToken = "fake-access-token";
      const fakeRefreshToken = "fake-refresh-token";

      // Set the same cookies your real callback sets after exchangeCodeForSession
      setCookie(
        event,
        `sb-${projectRef}-auth-token`,
        JSON.stringify({
          access_token: fakeAccessToken,
          refresh_token: fakeRefreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          expires_in: 3600,
          token_type: "bearer",
          user: {
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
          },
        }),
        {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 3600,
        },
      );

      // Redirect to wherever your real callback redirects to after success
      await sendRedirect(event, "/", 302);
    }
  });
});
