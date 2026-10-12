import { defineConfig } from 'vite';
import { cp } from 'node:fs/promises';
import { join } from 'node:path';

export default defineConfig({
  base: '/flowers/',
  server: {
    port: Number(process.env.PORT) || 5178,
    open: false,
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
    rollupOptions: {
      plugins: [
        {
          name: 'duplicate-public-assets-for-branch-pages',
          async closeBundle() {
            await cp(join('dist', 'flowers'), join('dist', 'public', 'flowers'), { recursive: true });
          },
        },
      ],
    },
  },
});
