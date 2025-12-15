import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // This replaces process.env.API_KEY with the actual string value during the build
    // ensuring it is never undefined at runtime.
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || '')
    },
    build: {
      outDir: 'dist',
    },
  };
});