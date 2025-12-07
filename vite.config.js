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
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/nova-ocr/, '/webhook/nova-ocr');
          console.log('[Vite Proxy] Rewriting:', path, '->', newPath);
          return newPath;
        },
        secure: true,
        ws: false, // Disable WebSocket proxying
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error:', err.message);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Vite Proxy] Request:', req.method, req.url, '->', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Vite Proxy] Response:', proxyRes.statusCode, 'for', req.url);
            // Add CORS headers if not already present
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-methods'] = 'POST, OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Accept';
          });
        }
      }
    }
  }
})
