import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // El usuario decide cuándo actualizar (ver components/PwaStatus.tsx)
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Futura · Sistema de Gestión Inmobiliaria',
        short_name: 'Futura',
        description: 'Propiedades, contratos, cobros y liquidaciones de Futura Servicios Inmobiliarios.',
        lang: 'es-AR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // En compu se instala como ventana de escritorio; en celular, como app a pantalla completa
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'any',
        theme_color: '#0F1E3A',
        background_color: '#F3F3F1',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Registrar cobro', url: '/admin/cobros', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Contratos', url: '/admin/contratos', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Catálogo', url: '/catalogo', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Poné true para probar el service worker con `npm run dev`
        enabled: false,
      },
    }),
  ],
})
