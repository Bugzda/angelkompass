import { useSyncExternalStore } from 'react'
import type { Conditions } from '../../domain/models/types'
import { isRecord, oneOf } from '../../domain/models/validation'
import { RESTORE_JOURNAL_KEY, SPOT_KEY } from '../data/storageKeys'
import { assertStorageReady } from '../data/storageTransaction'

/** Stable features of a fishing spot that rarely change between visits. */
export type SpotDefaults = Partial<
  Pick<Conditions, 'turbidity' | 'depth' | 'vegetation' | 'observedStructure' | 'structureStatus'>
>
export interface FishingSpot {
  id: string
  name: string
  defaults: SpotDefaults
  createdAt: string
  updatedAt: string
}
export const MAX_SPOT_NAME = 60
export const SPOT_FIELDS = ['turbidity', 'depth', 'vegetation', 'observedStructure', 'structureStatus'] as const

const validDate = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))

export function isSpotDefaults(value: unknown): value is SpotDefaults {
  if (!isRecord(value)) return false
  return (
    (value.turbidity === undefined || oneOf(value.turbidity, ['clear', 'slightly_turbid', 'turbid', 'unknown'])) &&
    (value.depth === undefined || oneOf(value.depth, ['shallow', 'medium', 'deep', 'unknown'])) &&
    (value.vegetation === undefined || oneOf(value.vegetation, ['none', 'edgeOrGaps', 'dense', 'unknown'])) &&
    (value.observedStructure === undefined ||
      (Array.isArray(value.observedStructure) &&
        value.observedStructure.every(item => oneOf(item, ['shallow', 'dropoff', 'hardCover'])))) &&
    (value.structureStatus === undefined || oneOf(value.structureStatus, ['unknown', 'none', 'observed']))
  )
}

export function isSpot(value: unknown): value is FishingSpot {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    /^[\w-][\w.-]*$/.test(value.id) &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    value.name.length <= MAX_SPOT_NAME &&
    isSpotDefaults(value.defaults) &&
    validDate(value.createdAt) &&
    validDate(value.updatedAt)
  )
}

/** Unknown or invalid entries are retained untouched, like inventory and sessions. */
export function parseSpots(raw: string): { spots: FishingSpot[]; retained: unknown[] } {
  const parsed: unknown = JSON.parse(raw)
  if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.spots))
    throw new Error('Ungültiges Format der Angelstellen')
  const spots: FishingSpot[] = []
  const retained: unknown[] = []
  const ids = new Set<string>()
  for (const item of parsed.spots) {
    if (isSpot(item) && !ids.has(item.id)) {
      ids.add(item.id)
      spots.push(item)
    } else retained.push(item)
  }
  return { spots, retained }
}

export function spotDefaultsFrom(conditions: Conditions): SpotDefaults {
  return {
    turbidity: conditions.turbidity,
    depth: conditions.depth,
    vegetation: conditions.vegetation,
    observedStructure: [...conditions.observedStructure],
    structureStatus: conditions.structureStatus ?? (conditions.observedStructure.length ? 'observed' : 'unknown'),
  }
}

/** Applies only the stored spot features; season, time, light and activity stay as observed today. */
export function applySpotDefaults(conditions: Conditions, defaults: SpotDefaults): Conditions {
  // Structures are species specific: hard cover is not offered for perch.
  const allowed = conditions.targetFish === 'perch' ? ['shallow', 'dropoff'] : ['shallow', 'dropoff', 'hardCover']
  const structure = defaults.observedStructure?.filter(item => allowed.includes(item))
  return {
    ...conditions,
    ...(defaults.turbidity && { turbidity: defaults.turbidity }),
    ...(defaults.depth && { depth: defaults.depth }),
    ...(defaults.vegetation && { vegetation: defaults.vegetation }),
    ...(structure && {
      observedStructure: structure,
      structureStatus: structure.length ? 'observed' : defaults.structureStatus === 'none' ? 'none' : 'unknown',
    }),
  }
}

export function sameSpotDefaults(conditions: Conditions, defaults: SpotDefaults) {
  return (
    JSON.stringify(spotDefaultsFrom(conditions)) ===
    JSON.stringify(spotDefaultsFrom(applySpotDefaults(conditions, defaults)))
  )
}

const listeners = new Set<() => void>()
let cache: FishingSpot[] | undefined
let retained: unknown[] = []
let lastError: string | undefined
let readBlocked = false

function read(): FishingSpot[] {
  readBlocked = false
  try {
    assertStorageReady()
    const data = parseSpots(localStorage.getItem(SPOT_KEY) ?? '{"schemaVersion":1,"spots":[]}')
    retained = data.retained
    lastError = undefined
    return data.spots.sort((a, b) => a.name.localeCompare(b.name, 'de'))
  } catch {
    readBlocked = true
    lastError = 'Die gespeicherten Angelstellen sind nicht lesbar. Bestehende Daten werden nicht überschrieben.'
    return cache ?? []
  }
}
const current = () => (cache ??= read())
function emit() {
  cache = read()
  listeners.forEach(listener => listener())
}
if (typeof window !== 'undefined')
  window.addEventListener('storage', event => {
    if (event.key === SPOT_KEY || event.key === RESTORE_JOURNAL_KEY || event.key === null) emit()
  })

function persist(spots: FishingSpot[]): boolean {
  try {
    if (readBlocked) throw new Error('Speicher nicht lesbar')
    localStorage.setItem(SPOT_KEY, JSON.stringify({ schemaVersion: 1, spots: [...spots, ...retained] }))
    emit()
    return true
  } catch {
    lastError = 'Die Angelstelle konnte nicht gespeichert werden. Prüfe den verfügbaren Browser-Speicher.'
    listeners.forEach(listener => listener())
    return false
  }
}

export const spotStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: current,
  getError: () => lastError,
  refresh: emit,
  create(name: string, defaults: SpotDefaults): FishingSpot | undefined {
    emit()
    const trimmed = name.trim().slice(0, MAX_SPOT_NAME)
    if (!trimmed || !isSpotDefaults(defaults)) return undefined
    const now = new Date().toISOString()
    const spot: FishingSpot = { id: crypto.randomUUID(), name: trimmed, defaults, createdAt: now, updatedAt: now }
    return persist([...current(), spot]) ? spot : undefined
  },
  update(id: string, change: { name?: string; defaults?: SpotDefaults }): boolean {
    emit()
    const name = change.name?.trim().slice(0, MAX_SPOT_NAME)
    if ((change.name !== undefined && !name) || (change.defaults && !isSpotDefaults(change.defaults))) return false
    if (!current().some(spot => spot.id === id)) return false
    return persist(
      current().map(spot =>
        spot.id === id
          ? {
              ...spot,
              ...(name && { name }),
              ...(change.defaults && { defaults: change.defaults }),
              updatedAt: new Date().toISOString(),
            }
          : spot,
      ),
    )
  },
  delete(id: string): boolean {
    emit()
    return persist(current().filter(spot => spot.id !== id))
  },
  resetForTests() {
    cache = undefined
    retained = []
    lastError = undefined
    readBlocked = false
    listeners.clear()
  },
}

export function useSpots() {
  const spots = useSyncExternalStore(spotStore.subscribe, spotStore.getSnapshot)
  return { spots, error: spotStore.getError() }
}
