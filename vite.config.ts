import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, isPreview }) => {
  const base = command === 'build' || isPreview ? '/angelkompass/' : '/'
  return {
  base,
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'icon-maskable.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'assets/terrain/*'],
    manifest: { name: 'Angelkompass', short_name: 'Angelkompass', description: 'Offline-Entscheidungshilfe für Barsch und Hecht vom Ufer – Zander folgt', theme_color: '#123c36', background_color: '#f4f5f0', display: 'standalone', start_url: base, scope: base, lang: 'de', icons: [{src:'icon-192.png?v=2',sizes:'192x192',type:'image/png',purpose:'any'},{src:'icon-512.png?v=2',sizes:'512x512',type:'image/png',purpose:'any'},{src:'icon-maskable-512.png?v=2',sizes:'512x512',type:'image/png',purpose:'maskable'},{src:'icon.svg?v=2',sizes:'any',type:'image/svg+xml',purpose:'any'}] },
    workbox: { navigateFallback: `${base}index.html`, globPatterns: ['**/*.{js,css,html,svg,woff2,webp,avif,png}'] }
  })],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
}})
