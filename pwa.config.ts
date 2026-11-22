import { definePwaConfig } from "@vite-pwa/nuxt/config";

export default definePwaConfig({
  registerType: "autoUpdate",
  manifest: {
    name: "Vehicle Hub",
    short_name: "VehicleHub",
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
  generateSW: {
    globPatterns: ["**/*.{js,css,png,svg,ico,woff2}"],
  },
  workbox: {
    navigateFallback: undefined,
  },
  client: { installPrompt: true },
  devOptions: { enabled: true, type: "module" },
});
