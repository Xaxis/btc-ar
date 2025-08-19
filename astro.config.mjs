// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://btcar.app',
  output: 'static',
  build: {
    format: 'file'
  },
  vite: {
    optimizeDeps: {
      include: ['tesseract.js']
    },
    server: {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  }
});
