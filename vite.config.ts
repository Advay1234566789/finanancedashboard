import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = env.VITE_API_URL || 'http://localhost:5000';

  return {
    server: {
      host: '::',
      port: 8080,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
    },
  };
});
