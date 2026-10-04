import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';
import type { Connect, Plugin } from 'vite';

// GitHub Pages redirige /para-luz a /para-luz/; en local (dev y preview) hacemos lo mismo.
const barraFinal: Connect.NextHandleFunction = (req, res, next) => {
  const [ruta, query] = (req.url ?? '').split('?');
  if (ruta.endsWith('/para-luz')) {
    res.statusCode = 301;
    res.setHeader('Location', `${ruta}/${query ? `?${query}` : ''}`);
    res.end();
    return;
  }
  next();
};
const redirigirParaLuz: Plugin = {
  name: 'redirigir-para-luz',
  configureServer: (server) => { server.middlewares.use(barraFinal); },
  configurePreviewServer: (server) => { server.middlewares.use(barraFinal); },
};

// Para GitHub Pages: BASE_PATH=/sale-a-la-luz/ pnpm build
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      // Dos páginas: la app y la carta en /para-luz/ (no enlazada desde la app).
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        'para-luz': resolve(import.meta.dirname, 'para-luz/index.html'),
      },
    },
  },
  plugins: [
    redirigirParaLuz,
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sale a la Luz',
        short_name: 'Sale a la Luz',
        description: 'Cartas de conversación: lo que nunca se dijo sale a la luz con la pregunta justa. Una noche con amigos, parejas y familia, un celular en el centro.',
        lang: 'es',
        theme_color: '#F7F3EE',
        background_color: '#F7F3EE',
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
        // La carta no se precachea ni la intercepta el service worker de la app.
        navigateFallbackDenylist: [/\/para-luz/],
        globIgnores: ['para-luz/**', 'assets/para-luz-*'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'fuentes', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
