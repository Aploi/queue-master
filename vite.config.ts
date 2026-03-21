import tailwind from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// If you’ll deploy on GitHub Pages under your repo path, set this:
//   const base = '/queue-master/'
// For local dev or user/org pages, use '/'.
const base = '/queue-master/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwind(),
    // Temporarily disable PWA to debug GitHub Pages blank page issue
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   // use RELATIVE paths so Vite rewrites with `base`
    //   manifest: {
    //     name: 'Queue Master',
    //     short_name: 'QueueMaster',
    //     description: 'Smart queue & court assignment PWA',
    //     theme_color: '#0ea5e9',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     scope: base,
    //     start_url: base,
    //     icons: [
    //       { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    //       { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    //       { src: 'icons/pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     navigateFallback: 'index.html',
    //     navigateFallbackDenylist: [/\.(?:png|jpg|jpeg|svg|gif|webp)$/],
    //   },
    // }),
  ],
})