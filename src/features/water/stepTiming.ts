import type { FishingSession } from '../../domain/models/types'

export const STEP_CLOCK_KEY = 'angelkompass.step-clock.v1'

interface ClockOverride {
  sessionId: string
  progress: FishingSession['progress']
  startedAt: string
}

/** Minute range from a switch-step limit such as "15–25 gute Würfe oder 10–15 Minuten". */
export function minuteRange(limit: string | undefined): { min: number; max: number } | undefined {
  if (!limit) return undefined
  const range = limit.match(/(\d+)\s*[–-]\s*(\d+)\s*Minuten/)
  if (range) return { min: Number(range[1]), max: Number(range[2]) }
  const single = limit.match(/(\d+)\s*Minuten/)
  return single ? { min: Number(single[1]), max: Number(single[1]) } : undefined
}

function readOverride(): ClockOverride | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STEP_CLOCK_KEY) ?? 'null')
    if (typeof value !== 'object' || value === null) return undefined
    const record = value as Record<string, unknown>
    return typeof record.sessionId === 'string' &&
      typeof record.progress === 'string' &&
      typeof record.startedAt === 'string' &&
      Number.isFinite(Date.parse(record.startedAt))
      ? (record as unknown as ClockOverride)
      : undefined
  } catch {
    return undefined
  }
}

/** The current step starts with the session or with the last "Ohne Kontakt" switch; a manual restart wins. */
export function stepStartedAt(session: FishingSession): string {
  const override = readOverride()
  if (override && override.sessionId === session.id && override.progress === session.progress) return override.startedAt
  if (session.progress === 'initial') return session.createdAt
  return [...session.feedback].reverse().find(item => item.outcome === 'no_success')?.createdAt ?? session.createdAt
}

export function restartStepClock(session: FishingSession, now = new Date()) {
  try {
    localStorage.setItem(
      STEP_CLOCK_KEY,
      JSON.stringify({ sessionId: session.id, progress: session.progress, startedAt: now.toISOString() }),
    )
  } catch {
    /* Without storage the automatic step start remains in use. */
  }
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}
