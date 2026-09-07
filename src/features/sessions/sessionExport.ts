import type { FishingSession } from '../../domain/models/types'
import { downloadJson } from '../data/downloadJson'

export function serializeSessions(sessions: readonly FishingSession[], exportedAt = new Date()) {
  return JSON.stringify({ schemaVersion: 1, app: 'Angelkompass', exportedAt: exportedAt.toISOString(), sessions }, null, 2)
}

export function downloadSessions(sessions: readonly FishingSession[]) {
  const now = new Date()
  downloadJson(serializeSessions(sessions, now), `angelkompass-sessions-${now.toISOString().slice(0, 10)}.json`)
}
