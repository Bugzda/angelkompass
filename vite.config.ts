import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icon.svg'],
    manifest: { name: 'Angelkompass', short_name: 'Angelkompass', description: 'Barsch-Empfehlungen für das Uferangeln', theme_color: '#0a3d3f', background_color: '#f4f1e8', display: 'standalone', start_url: '/', lang: 'de', icons: [{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}] },
    workbox: { navigateFallback: '/index.html', globPatterns: ['**/*.{js,css,html,svg}'] }
  })],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
})
