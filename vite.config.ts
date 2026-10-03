import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, isPreview }) => {
  const base = command === 'build' || isPreview ? '/angelkompass/' : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        // The glob below includes all icons and public images exactly once.
        includeManifestIcons: false,
        manifest: {
          name: 'Angelkompass',
          short_name: 'Angelkompass',
          description: 'Offline-Entscheidungshilfe für Barsch, Hecht und Zander vom Ufer',
          // Matches the dark launch surface so the splash screen does not flash white.
          theme_color: '#141714',
          background_color: '#141714',
          display: 'standalone',
          start_url: base,
          scope: base,
          lang: 'de',
          shortcuts: [
            {
              name: 'Aktiver Angelplan',
              short_name: 'Aktiver Plan',
              url: `${base}aktiv`,
              icons: [{ src: 'icon-192.png?v=3', sizes: '192x192' }],
            },
            {
              name: 'Neuer Angelplan',
              short_name: 'Planen',
              url: `${base}neu`,
              icons: [{ src: 'icon-192.png?v=3', sizes: '192x192' }],
            },
            { name: 'Köderbox', url: `${base}bestand`, icons: [{ src: 'icon-192.png?v=3', sizes: '192x192' }] },
            { name: 'Logbuch', url: `${base}verlauf`, icons: [{ src: 'icon-192.png?v=3', sizes: '192x192' }] },
          ],
          screenshots: [
            {
              src: 'screenshots/home.jpg',
              sizes: '780x1688',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'Start mit aktivem Angelplan',
            },
            {
              src: 'screenshots/plan.jpg',
              sizes: '780x1688',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'Angelplan aus der eigenen Köderbox',
            },
            {
              src: 'screenshots/water.jpg',
              sizes: '780x1688',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'Am-Wasser-Karte mit Schrittuhr',
            },
          ],
          icons: [
            { src: 'icon-192.png?v=3', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icon-512.png?v=3', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icon-maskable-512.png?v=3', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: 'icon.svg?v=3', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          ],
        },
        workbox: {
          // Claim the first installation immediately; updates still wait for consent.
          clientsClaim: true,
          // Public assets/terrain files have stable names and need a content revision.
          dontCacheBustURLsMatching: /^assets\/[^/]+-[\w-]{8}\./,
          navigateFallback: `${base}index.html`,
          globPatterns: ['**/*.{js,css,html,svg,woff2,webp,avif,png}'],
        },
      }),
    ],
    test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
  }
})
