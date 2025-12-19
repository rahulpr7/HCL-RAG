import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
    server: {
      port: 3000,
      proxy: {
        // Proxy API requests to the Node.js backend
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});