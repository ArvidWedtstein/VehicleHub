// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
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
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
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
