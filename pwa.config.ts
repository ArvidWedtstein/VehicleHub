import { definePwaConfig } from "@vite-pwa/nuxt/config";

export default definePwaConfig({
  registerType: "prompt",
  manifest: {
    name: "Vehicle Hub",
    short_name: "VehicleHub",
    description: "A vehicle management application.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
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
    globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
  },
  workbox: {
    navigateFallback: undefined,
  },
  client: { installPrompt: true, periodicSyncForUpdates: 3600 },
  devOptions: { enabled: true, type: "module" },
});
