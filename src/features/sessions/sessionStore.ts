import type { Conditions, FeedbackOutcome, FishingSession, Recommendation, SessionProgress } from '../../domain/models/types'
import { profileFor } from '../../domain/species/profiles'

const STORAGE_KEY = 'angelkompass.sessions.v1'
const SCHEMA_VERSION = 1 as const
interface SessionEnvelope { schemaVersion: 1; sessions: FishingSession[] }

const listeners = new Set<() => void>()
let cache: FishingSession[] | undefined
let lastError: string | undefined

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const oneOf = (value: unknown, values: readonly string[]) => typeof value === 'string' && values.includes(value)

function isConditions(value: unknown): value is Conditions {
  if (!isRecord(value) || !isRecord(value.activity)) return false
  return oneOf(value.targetFish,['perch','pike']) && value.waterType === 'lake' &&
    oneOf(value.season, ['spring', 'summer', 'autumn', 'winter']) &&
    oneOf(value.timeOfDay, ['dawn', 'day', 'dusk', 'night', 'unknown']) &&
    oneOf(value.turbidity, ['clear', 'slightly_turbid', 'turbid', 'unknown']) &&
    oneOf(value.depth, ['shallow', 'medium', 'deep', 'unknown']) &&
    oneOf(value.waterTemperature, ['cold', 'cool', 'mild', 'warm', 'hot', 'unknown']) &&
    oneOf(value.light, ['bright', 'diffuse', 'dark', 'unknown']) &&
    oneOf(value.vegetation, ['none', 'edgeOrGaps', 'dense', 'unknown']) && Array.isArray(value.observedStructure) &&
    oneOf(value.activity.status, ['unknown', 'none', 'observed']) && Array.isArray(value.activity.signs) &&
    (value.targetFish!=='pike'||value.pikeSafetyConfirmed===true)
}

function isRecommendation(value: unknown): value is Recommendation {
  if (!isRecord(value) || !isRecord(value.spot) || !isRecord(value.spot.spot) || !isRecord(value.setup) || !isRecord(value.setup.lure)) return false
  return typeof value.rank === 'number' && typeof value.spot.spot.label === 'string' && typeof value.setup.lure.label === 'string' &&
    Array.isArray(value.switchPlan) && value.switchPlan.length === 3 && value.switchPlan.every((step) => isRecord(step) && oneOf(step.phase, ['initial', 'refine', 'move']) && typeof step.title === 'string')
}

function isFeedback(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && oneOf(value.outcome, ['bite', 'catch', 'no_success']) &&
    oneOf(value.phase, ['initial', 'refine', 'move']) && typeof value.createdAt === 'string'
}

function isSession(value: unknown): value is FishingSession {
  if (!isRecord(value)) return false
  const validProgress = ['initial', 'refine', 'move', 'exhausted'].includes(String(value.progress))
  const validStatus = value.status === 'active' || value.status === 'completed'
  return value.schemaVersion === 1 && typeof value.id === 'string' && typeof value.rulesetVersion === 'string' &&
    isConditions(value.conditions) && isRecommendation(value.recommendation) && Array.isArray(value.feedback) && value.feedback.every(isFeedback) && validProgress && validStatus &&
    typeof value.createdAt === 'string' && typeof value.updatedAt === 'string'
}

function read(): FishingSession[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{"schemaVersion":1,"sessions":[]}')
    if (!isRecord(parsed) || parsed.schemaVersion !== SCHEMA_VERSION || !Array.isArray(parsed.sessions)) return []
    const sessions = parsed.sessions.filter(isSession).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    let activeFound = false
    return sessions.filter((session) => {
      if (session.status !== 'active') return true
      if (activeFound) return false
      activeFound = true
      return true
    })
  } catch {
    return []
  }
}

function current() { return cache ??= read() }
function emit() { cache = read(); listeners.forEach((listener) => listener()) }

function persist(sessions: FishingSession[]): boolean {
  try {
    const envelope: SessionEnvelope = { schemaVersion: SCHEMA_VERSION, sessions }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
    lastError = undefined
    emit()
    return true
  } catch {
    lastError = 'Die Session konnte nicht lokal gespeichert werden. Prüfe den verfügbaren Browser-Speicher.'
    cache = [...current()]
    listeners.forEach((listener) => listener())
    return false
  }
}

export const sessionStore = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  getSnapshot: current,
  getError: () => lastError,
  clearError() { lastError = undefined; cache = [...current()]; listeners.forEach((listener) => listener()) },
  create(conditions: Conditions, recommendation: Recommendation): FishingSession | undefined {
    if (current().some((session) => session.status === 'active')) return undefined
    const now = new Date().toISOString()
    const session: FishingSession = {
      id: crypto.randomUUID(), schemaVersion: SCHEMA_VERSION, rulesetVersion: profileFor(conditions.targetFish).rulesetVersion,
      conditions, recommendation, progress: 'initial', feedback: [], status: 'active', createdAt: now, updatedAt: now,
    }
    return persist([session, ...current()]) ? session : undefined
  },
  addFeedback(id: string, outcome: FeedbackOutcome): boolean {
    const sessions = current()
    const session = sessions.find((item) => item.id === id)
    if (!session || session.status !== 'active' || session.progress === 'exhausted') return false
    const now = new Date().toISOString()
    const next: Record<Exclude<SessionProgress, 'exhausted'>, SessionProgress> = { initial: 'refine', refine: 'move', move: 'exhausted' }
    const updated: FishingSession = {
      ...session,
      progress: outcome === 'no_success' ? next[session.progress] : session.progress,
      feedback: [...session.feedback, { id: crypto.randomUUID(), outcome, phase: session.progress, createdAt: now }],
      updatedAt: now,
    }
    return persist(sessions.map((item) => item.id === id ? updated : item))
  },
  complete(id: string): boolean {
    if (!current().some((session) => session.id === id && session.status === 'active')) return false
    const now = new Date().toISOString()
    return persist(current().map((session) => session.id === id && session.status === 'active'
      ? { ...session, status: 'completed' as const, completedAt: now, updatedAt: now }
      : session))
  },
  delete(id: string): boolean { return persist(current().filter((session) => session.id !== id)) },
  resetForTests() { cache = undefined; lastError = undefined; listeners.clear() },
}
