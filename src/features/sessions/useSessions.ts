import { useSyncExternalStore } from 'react'
import { sessionStore } from './sessionStore'

export function useSessions() {
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  return { sessions, activeSession: sessions.find((session) => session.status === 'active'), error: sessionStore.getError() }
}
