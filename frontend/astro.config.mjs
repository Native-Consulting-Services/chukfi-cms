// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static", // Static build - all data fetched client-side from Go API
  integrations: [react()],
  server: {
    port: 4321,
    host: true,
  },
  build: {
    assets: "_astro",
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.API_URL": JSON.stringify(
        process.env.API_URL || "http://localhost:8080",
      ),
    },
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1000, // Increase limit to 1000 KB for large editor components
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress warnings about unused imports in Astro's internal files
          if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
          warn(warning);
        },
      },
    },
  },
});
