import { StrictMode } from 'react'; import { createRoot } from 'react-dom/client'; import { registerSW } from 'virtual:pwa-register'; import { App } from './app/App'; import { pwaStatusStore } from './ui/hooks/usePwaStatus'; import './ui/theme/styles.css'
const updateSW = registerSW({
  immediate: true,
  onOfflineReady(){pwaStatusStore.offlineReady()},
  onNeedRefresh(){pwaStatusStore.updateReady(updateSW)},
})
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>)
