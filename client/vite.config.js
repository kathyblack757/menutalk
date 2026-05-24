import { fileURLToPath, URL } from 'url';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const certPath = new URL('localhost-key.pem', import.meta.url);
const keyPath = new URL('localhost.pem', import.meta.url);
const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

export default defineConfig({
  server: {
    https: hasCerts ? {
      key: fs.readFileSync(certPath),
      cert: fs.readFileSync(keyPath),
    } : undefined,
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
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
});
