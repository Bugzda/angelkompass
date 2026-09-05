import type { FishingSession } from '../../domain/models/types'

export function serializeSessions(sessions: readonly FishingSession[], exportedAt = new Date()) {
  return JSON.stringify({ schemaVersion: 1, app: 'Angelkompass', exportedAt: exportedAt.toISOString(), sessions }, null, 2)
}

export function downloadSessions(sessions: readonly FishingSession[]) {
  const now = new Date()
  const url = URL.createObjectURL(new Blob([serializeSessions(sessions, now)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `angelkompass-sessions-${now.toISOString().slice(0, 10)}.json`
  document.body.append(link)
  try { link.click() } finally {
    link.remove()
    // Let the browser consume the download before releasing the blob.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
