import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/angelkompass/' : '/'
  return {
  base,
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: { name: 'Angelkompass', short_name: 'Angelkompass', description: 'Offline-Entscheidungshilfe für Barsch und Hecht vom Ufer', theme_color: '#0a3d3f', background_color: '#f4f1e8', display: 'standalone', start_url: base, scope: base, lang: 'de', icons: [{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}] },
    workbox: { navigateFallback: `${base}index.html`, globPatterns: ['**/*.{js,css,html,svg}'] }
  })],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
}})
