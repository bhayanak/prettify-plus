import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// This config builds the HTML pages (viewer + popup).
// Content script and background are built separately via vite.config.content.ts / vite.config.background.ts
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        viewer: resolve(__dirname, 'src/viewer/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
    },
    outDir: 'dist',
    emptyDir: true,
  },
});
