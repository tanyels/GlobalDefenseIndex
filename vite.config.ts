import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This bridges the gap between node-style process.env and Vite's browser-style import.meta.env
  define: {
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  },
  build: {
    outDir: 'dist',
  },
});