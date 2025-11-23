import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: {
    port: 4321,
    host: true,
  },
  build: {
    assets: '_astro',
  },
  vite: {
    define: {
      'import.meta.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:8080'),
    },
  },
});