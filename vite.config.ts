import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Para GitHub Pages: BASE_PATH=/charlemos/ pnpm build
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Charlemos',
        short_name: 'Charlemos',
        description: 'Cartas de conversación para una noche con amigos, parejas y familia.',
        lang: 'es',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
