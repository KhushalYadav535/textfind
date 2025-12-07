import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  preview: {
    port: 3000,
  },
  server: {
    port: 3000,
    proxy: {
      '/api/nova-ocr': {
        target: 'https://n8n.srv980418.hstgr.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nova-ocr/, '/webhook/nova-ocr'),
        secure: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    }
  }
})
