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
      ],
      title: "VehicleHub",
      meta: [
        {
          name: "description",
          content: "A vehicle management application.",
        },
      ],
    },
    pageTransition: { name: "fade", mode: "out-in" },
  },
  experimental: {
    viewTransition: true,
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },
  css: ["~/assets/app.css"],
  modules: ["@nuxtjs/supabase", "@nuxt/icon"],
  supabase: {
    redirect: false,
    redirectOptions: {
      callback: "/callback",
      login: "/login",
      exclude: ["/"],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: "",
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
