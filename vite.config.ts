import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Replaces 'process.env.API_KEY' with the string value of VITE_API_KEY from .env
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
    },
    build: {
      outDir: 'dist',
    },
  };
});