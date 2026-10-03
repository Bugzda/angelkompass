import { useSyncExternalStore } from 'react'

interface ToastMessage {
  id: number
  text: string
}

let current: ToastMessage | undefined
let nextId = 1
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(listener => listener())

/** Short, non-blocking confirmation. A newer message replaces the visible one. */
export function showToast(text: string, durationMs = 3200) {
  current = { id: nextId++, text }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    current = undefined
    emit()
  }, durationMs)
  emit()
}

export function dismissToast() {
  if (timer) clearTimeout(timer)
  current = undefined
  emit()
}

const store = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => current,
}

export function ToastViewport() {
  const toast = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toast && (
        <button type="button" key={toast.id} className="toast" onClick={dismissToast}>
          {toast.text}
        </button>
      )}
    </div>
  )
}
