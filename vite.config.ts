import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { inject } from 'vite-plugin-external'; // Agar ye nahi hai toh niche ka alternative use karein

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Purane Gemini Keys
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        
        // NAYA: Buffer aur Global Fix
        'global': 'window', // Browser mein global ko window man-ne ke liye
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          // NAYA: Buffer library ka alias
          'buffer': 'buffer', 
        }
      },
      optimizeDeps: {
        include: ['buffer', 'bloom-filters'],
      }
    };
});
