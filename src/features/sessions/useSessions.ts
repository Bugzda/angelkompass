import { useSyncExternalStore } from 'react'
import { sessionStore } from './sessionStore'

export function useSessions() {
  const sessions = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot)
  return { sessions, activeSession: sessions.find((session) => session.status === 'active'), latestSession: sessions[0], error: sessionStore.getError() }
}
