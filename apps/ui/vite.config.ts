import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    fs: {
      // Required for vite-plugin-pwa to serve dev-dist/workbox-*.js in dev mode
      allow: ["../.."],
    },
  },
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      manifest: {
        name: "Lofi Radio",
        short_name: "Lofi Radio",
        description: "A local-first podcast app",
        theme_color: "#ffffff",
        background_color: "#0a0a0a",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["client/**/*.{js,css,html,svg,png,woff2,json}"],
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.+\.(?:png|jpg|jpeg|webp|gif)(?:\?.*)?$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "podcast-image-cache",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/",
        // dev-dist/ is flat; production glob patterns (client/**/*,
        // prerendered/**/*) don't exist there and produce Workbox warnings in dev.
        suppressWarnings: true,
      },
      kit: {
        adapterFallback: "plaintext",
      },
    }),
  ],
});
