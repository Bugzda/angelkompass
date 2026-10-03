import { useEffect } from 'react'
import { usePwaStatus } from '../hooks/usePwaStatus'
import { Icon } from './Icon'
import { showToast } from './Toast'

const ANNOUNCED_KEY = 'angelkompass.offline-announced.v1'

/** Stays out of the way while online; offline use is the only state worth a permanent hint. */
export function ConnectionStatus() {
  const { online, offlineReady } = usePwaStatus()
  useEffect(() => {
    if (!offlineReady) return
    try {
      if (localStorage.getItem(ANNOUNCED_KEY) === '1') return
      localStorage.setItem(ANNOUNCED_KEY, '1')
    } catch {
      /* Without storage the hint may appear again on the next visit. */
    }
    showToast('Offline bereit · Angelkompass funktioniert jetzt auch ohne Internet.', 4500)
  }, [offlineReady])
  if (online) return null
  return (
    <div className="app-status offline" role="status">
      <Icon name="status-offline" size={17} />
      <strong>{offlineReady ? 'Offline verfügbar' : 'Offline'}</strong>
      <span className="offline-detail">
        {offlineReady ? 'Alles außer dem Wetterabruf funktioniert.' : 'Offline-Bereitschaft noch nicht bestätigt.'}
      </span>
    </div>
  )
}
