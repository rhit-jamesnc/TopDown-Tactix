import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, '../docs/**/*.md')),
          dest: 'docs'
        }
      ]
    })
  ],
  publicDir: '../',
  server: {
    watch: {
      ignored: ['!../docs/**'], 
    },
  },
});