import type { Conditions, FeedbackOutcome, FishingSession, Recommendation, SessionProgress } from '../../domain/models/types'
import { profileFor } from '../../domain/species/profiles'
import { canRecommend } from '../../domain/models/validation'

const STORAGE_KEY = 'angelkompass.sessions.v1'
const SCHEMA_VERSION = 1 as const
interface SessionEnvelope { schemaVersion: 1; sessions: FishingSession[] }

const listeners = new Set<() => void>()
let cache: FishingSession[] | undefined
let lastError: string | undefined
let readBlocked = false

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const oneOf = (value: unknown, values: readonly string[]) => typeof value === 'string' && values.includes(value)
const stringArray = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === 'string')
const validDate = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))

function isConditions(value: unknown): value is Conditions {
  return canRecommend(value)
}

function isRecommendation(value: unknown): value is Recommendation {
  if (!isRecord(value) || !isRecord(value.spot) || !isRecord(value.spot.spot) || !isRecord(value.setup) || !isRecord(value.setup.lure)) return false
  const color=value.colorGuidance
  if(!isRecord(color)||!stringArray(color.examples))return false
  if(!['baseLabel','finishLabel','accentLabel','alternative'].every(key=>color[key]===undefined||typeof color[key]==='string'))return false
  const presentation=value.setup.resolvedPresentation
  const validPresentation=presentation===undefined||(isRecord(presentation)&&typeof presentation.profileId==='string'&&typeof presentation.profileLabel==='string'&&typeof presentation.mounting==='string'&&typeof presentation.sizeLabel==='string'&&typeof presentation.weightLabel==='string'&&typeof presentation.guidance==='string'&&oneOf(presentation.weightKind,['terminal','lure-total','none'])&&oneOf(presentation.mode,['slow','controlled','active']))
  return Number.isInteger(value.rank) && Number(value.rank)>0 && typeof value.spot.spot.label === 'string' && typeof value.setup.lure.id === 'string' && typeof value.setup.lure.label === 'string' && typeof value.setup.lure.mounting === 'string' && typeof value.setup.lure.guidance === 'string' &&
    oneOf(value.setup.size,['small','medium','large'])&&oneOf(value.setup.weight,['ultralight','light','medium','heavy'])&&oneOf(value.setup.color,['natural','contrast','transparent'])&&validPresentation&&
    oneOf(color.family,['natural','contrast','transparent'])&&typeof color.familyLabel==='string'&&typeof color.reason==='string'&&stringArray(value.reasons)&&
    Array.isArray(value.switchPlan) && value.switchPlan.length === 3 && value.switchPlan.every((step,index) => isRecord(step) && step.phase===['initial', 'refine', 'move'][index] && typeof step.title === 'string'&&typeof step.change==='string'&&typeof step.limit==='string'&&typeof step.reason==='string')
}

function isFeedback(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && oneOf(value.outcome, ['bite', 'catch', 'no_success']) &&
    oneOf(value.phase, ['initial', 'refine', 'move']) && validDate(value.createdAt)
}

function isSession(value: unknown): value is FishingSession {
  if (!isRecord(value)) return false
  const validProgress = oneOf(value.progress, ['initial', 'refine', 'move', 'exhausted'])
  const validStatus = value.status === 'active' || value.status === 'completed'
  return value.schemaVersion === 1 && typeof value.id === 'string' && typeof value.rulesetVersion === 'string' &&
    isConditions(value.conditions) && isRecommendation(value.recommendation) && Array.isArray(value.feedback) && value.feedback.every(isFeedback) && validProgress && validStatus &&
    validDate(value.createdAt) && validDate(value.updatedAt) && (value.completedAt===undefined||validDate(value.completedAt))
}

function read(): FishingSession[] {
  readBlocked=false
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{"schemaVersion":1,"sessions":[]}')
    if (!isRecord(parsed) || parsed.schemaVersion !== SCHEMA_VERSION || !Array.isArray(parsed.sessions)) throw new Error('Ungültiges Sessionformat')
    const sessions = parsed.sessions.filter(isSession).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    let activeFound = false
    return sessions.filter((session) => {
      if (session.status !== 'active') return true
      if (activeFound) return false
      activeFound = true
      return true
    })
  } catch {
    readBlocked=true
    lastError='Die gespeicherten Sessions sind nicht lesbar. Bestehende Daten werden nicht überschrieben. Prüfe den Browser-Speicher.'
    return cache ?? []
  }
}

function current() { return cache ??= read() }
function emit() { cache = [...read()]; listeners.forEach((listener) => listener()) }

if(typeof window!=='undefined')window.addEventListener('storage',event=>{
  if(event.key===STORAGE_KEY||event.key===null){lastError=undefined;emit()}
})

function persist(sessions: FishingSession[]): boolean {
  try {
    if(readBlocked)throw new Error('Speicher nicht lesbar')
    const envelope: SessionEnvelope = { schemaVersion: SCHEMA_VERSION, sessions }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
    lastError = undefined
    emit()
    return true
  } catch {
    lastError = 'Die Session konnte nicht lokal gespeichert werden. Prüfe den verfügbaren Browser-Speicher. Bestehende Daten bleiben erhalten.'
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
    emit()
    if(!isConditions(conditions)||!isRecommendation(recommendation))return undefined
    if (current().some((session) => session.status === 'active')) return undefined
    const now = new Date().toISOString()
    const session: FishingSession = {
      id: crypto.randomUUID(), schemaVersion: SCHEMA_VERSION, rulesetVersion: profileFor(conditions.targetFish).rulesetVersion,
      conditions, recommendation, progress: 'initial', feedback: [], status: 'active', createdAt: now, updatedAt: now,
    }
    return persist([session, ...current()]) ? session : undefined
  },
  addFeedback(id: string, outcome: FeedbackOutcome): boolean {
    emit()
    if(!oneOf(outcome,['bite','catch','no_success']))return false
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
    emit()
    if (!current().some((session) => session.id === id && session.status === 'active')) return false
    const now = new Date().toISOString()
    return persist(current().map((session) => session.id === id && session.status === 'active'
      ? { ...session, status: 'completed' as const, completedAt: now, updatedAt: now }
      : session))
  },
  undoFeedback(id: string): boolean {
    emit()
    const session=current().find(item=>item.id===id)
    const last=session?.feedback.at(-1)
    if(!session||session.status!=='active'||!last)return false
    return persist(current().map(item=>item.id===id?{
      ...item,progress:last.phase,feedback:item.feedback.slice(0,-1),updatedAt:new Date().toISOString(),
    }:item))
  },
  delete(id: string): boolean { emit();return persist(current().filter((session) => session.id !== id)) },
  resetForTests() { cache = undefined; lastError = undefined; readBlocked=false; listeners.clear() },
}
