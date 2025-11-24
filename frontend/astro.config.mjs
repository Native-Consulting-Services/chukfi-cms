// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
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
        process.env.API_URL || "http://localhost:8080"
      ),
    },
    build: {
      cssCodeSplit: false,
    },
  },
});
