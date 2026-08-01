import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5178,
    open: false,
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
  },
});
