// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      ],
      title: "Vehicle Hub",
      meta: [
        {
          name: "description",
          content: "A vehicle management application.",
        },
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
    dirs: ["~/composables", "~/composables/vehicle/**"],
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit", "zod"],
    },
  },
  css: ["~/assets/app.css"],
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@nuxt/icon"],
  supabase: {
    redirect: false,
    redirectOptions: {
      callback: "/callback",
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
  icon: {
    serverBundle: {
      collections: ["mdi"],
    },
  },
});
