import { defineConfig } from 'vite';
import { resolve } from 'path';

// Builds background.js as a self-contained IIFE (no imports)
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'PrettifyPlusBackground',
      formats: ['iife'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
