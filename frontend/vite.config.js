import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LekkRek',
        short_name: 'LekkRek',
        description: 'Les menus du jour à Ziguinchor',
        theme_color: '#dc2626', // Tailwind red-600
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://placehold.co/192x192/dc2626/ffffff?text=LR', // Temp icon
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512x512/dc2626/ffffff?text=LR', // Temp icon
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512x512/dc2626/ffffff?text=LR',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\/public\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lekkrek-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
