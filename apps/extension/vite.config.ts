import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.FRONTEND_URL': JSON.stringify(
      process.env.FRONTEND_URL || 'http://localhost:4200'
    ),
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/background.ts'),
      formats: ['es'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.js',
      },
    },
    target: 'esnext',
    minify: false,
    sourcemap: process.env.NODE_ENV === 'development',
  },
  publicDir: resolve(__dirname, 'public'),
});
