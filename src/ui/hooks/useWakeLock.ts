import { useEffect, useState } from 'react'

type WakeLockState = 'unsupported' | 'off' | 'active' | 'blocked'

/** Requests a screen wake lock while enabled and re-acquires it after the page becomes visible again. */
export function useWakeLock(enabled: boolean): WakeLockState {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [state, setState] = useState<WakeLockState>(supported ? 'off' : 'unsupported')
  useEffect(() => {
    if (!supported || !enabled) {
      setState(supported ? 'off' : 'unsupported')
      return
    }
    let sentinel: WakeLockSentinel | undefined
    let cancelled = false
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || sentinel) return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void lock.release()
          return
        }
        sentinel = lock
        setState('active')
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = undefined
          if (!cancelled) setState('off')
        })
      } catch {
        if (!cancelled) setState('blocked')
      }
    }
    const onVisibility = () => void acquire()
    document.addEventListener('visibilitychange', onVisibility)
    void acquire()
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release().catch(() => {})
      sentinel = undefined
    }
  }, [enabled, supported])
  return state
}
