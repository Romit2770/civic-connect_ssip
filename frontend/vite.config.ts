import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5001',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err: any) => {
            // Suppress benign client-aborted connections when browser refreshes or navigates
            if (['ECONNABORTED', 'ECONNRESET', 'EPIPE'].includes(err?.code)) {
              return;
            }
            if (err?.code === 'ECONNREFUSED') {
              return;
            }
            console.warn('[vite-proxy] ws proxy note:', err?.code || err?.message);
          });
        },
      },
    },
  },
});
