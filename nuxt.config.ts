// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    baseURL: "/",
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Vehicle Hub",
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      ],
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no",
        },
        {
          name: "description",
          content: "A vehicle management application.",
        },
        { name: "format-detection", content: "telephone=no" },
        {
          name: "theme-color",
          content: "#ffffff",
          media: "(prefers-color-scheme: light)",
        },
        {
          name: "theme-color",
          content: "#0f172a",
          media: "(prefers-color-scheme: dark)",
        },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "Vehicle Hub" },
      ],
    },
    pageTransition: { name: "fade", mode: "out-in" },
  },
  routeRules: {
    "/vehicles/": { appLayout: false },
    "/vehicles/:id/**": { appLayout: "vehicle" },
  },
  imports: {
    dirs: ["~/composables", "~/composables/vehicle/**", "~/shared/schemas/**"],
  },
  nitro: {
    imports: {
      dirs: ["~/shared/schemas/**"],
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  test: true,
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "zod",
        "@internationalized/date",
      ],
    },
  },
  css: ["~/assets/app.css"],
  modules: [
    "@nuxt/ui",
    "@nuxtjs/supabase",
    "@nuxt/icon",
    "@nuxt/test-utils/module",
    "@vite-pwa/nuxt",
  ],
  supabase: {
    redirect: false,
    redirectOptions: {
      callback: "/auth/callback",
      login: "/login",
      include: ["/vehicles(/*)"],
      saveRedirectToCookie: true,
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    types: "~/types/supabase",
  },
  typescript: {
    strict: true,
  },
  icon: {
    collections: ["mdi"],
    serverBundle: {
      collections: ["mdi"],
    },
  },
  runtimeConfig: {
    cronSecret: "",
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Vehicle Hub",
      short_name: "Vehicle Hub",
      description: "A vehicle management application.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
      navigateFallback: undefined, // see note below
    },
    client: { installPrompt: true },
    devOptions: { enabled: true, type: "module" },
  },
});
