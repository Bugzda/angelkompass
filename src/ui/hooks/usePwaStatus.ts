import { useSyncExternalStore } from 'react'

export interface PwaStatus {
  online: boolean
  offlineReady: boolean
  updateAvailable: boolean
}

let state: PwaStatus = {
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  offlineReady: typeof localStorage !== 'undefined' && localStorage.getItem('angelkompass.offlineReady.v1') === 'true',
  updateAvailable: false,
}
let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const setState = (next: Partial<PwaStatus>) => { state = { ...state, ...next }; emit() }

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => setState({ online: true }))
  window.addEventListener('offline', () => setState({ online: false }))
}

export const pwaStatusStore = {
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
  getSnapshot: () => state,
  offlineReady() { localStorage.setItem('angelkompass.offlineReady.v1', 'true'); setState({ offlineReady: true }) },
  updateReady(update: (reloadPage?: boolean) => Promise<void>) { updateServiceWorker = update; setState({ updateAvailable: true }) },
  dismissUpdate() { setState({ updateAvailable: false }) },
  async applyUpdate() { if (updateServiceWorker) await updateServiceWorker(true) },
}

export function usePwaStatus() {
  const status = useSyncExternalStore(pwaStatusStore.subscribe, pwaStatusStore.getSnapshot)
  return { ...status, applyUpdate: pwaStatusStore.applyUpdate, dismissUpdate: pwaStatusStore.dismissUpdate }
}
