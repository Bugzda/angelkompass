import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app/App'
import { pwaStatusStore } from './ui/hooks/usePwaStatus'
import './ui/theme/styles.css'
import { removeRetiredPhotoData } from './app/removeRetiredPhotoData'
import { recoverPendingRestore } from './features/data/storageTransaction'
import { observeOfflineReadiness } from './app/offlineReadiness'
import { createPwaUpdateFlow } from './app/pwaUpdateFlow'
import { sessionStore } from './features/sessions/sessionStore'

let recoveryError = false
try {
  recoverPendingRestore()
} catch {
  recoveryError = true
}
void removeRetiredPhotoData().catch(() => {})
if ('serviceWorker' in navigator) observeOfflineReadiness(navigator.serviceWorker, pwaStatusStore.offlineReady)
const updateFlow = createPwaUpdateFlow({
  activate: () => updateSW(true),
  reload: () => window.location.reload(),
  canReload: () => !sessionStore.getSnapshot().some(session => session.status === 'active'),
  offer: pwaStatusStore.updateReady,
})
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh: updateFlow.available,
  onNeedReload: updateFlow.activated,
})
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {recoveryError ? (
      <main className="page-shell empty-state">
        <h1>Wiederherstellung pausiert.</h1>
        <p>
          Eine unterbrochene Datensicherung konnte noch nicht zurückgesetzt werden. Deine Sicherung bleibt erhalten.
          Prüfe den verfügbaren Browser-Speicher und öffne die App erneut.
        </p>
        <button className="primary" onClick={() => window.location.reload()}>
          Erneut versuchen
        </button>
      </main>
    ) : (
      <App />
    )}
  </StrictMode>,
)
