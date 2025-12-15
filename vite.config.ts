import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // We cast process to any to avoid TS errors in the config file itself.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Replace process.env.API_KEY with the actual string value
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
      // Prevent crashes if code tries to access process.env.VITE_API_KEY directly
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || '')
    },
    build: {
      outDir: 'dist',
    },
  };
});