import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In development, Vite forwards every /api request to your Laravel app,
// so the browser sees one origin and you need no CORS setup.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'http://localhost:8000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target, changeOrigin: true },
      },
    },
  };
});
