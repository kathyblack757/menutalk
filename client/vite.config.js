import { fileURLToPath, URL } from 'url';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(new URL('localhost-key.pem', import.meta.url)),
      cert: fs.readFileSync(new URL('localhost.pem', import.meta.url)),
    },
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
});
