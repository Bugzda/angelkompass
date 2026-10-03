import type { FishingSession, InventoryItem } from '../../domain/models/types'
import { isRecord } from '../../domain/models/validation'
import {
  INVENTORY_KEY,
  LEGACY_INVENTORY_KEYS,
  isInventoryItem,
  loadInventory,
  mergeInventory,
  parseInventory,
} from '../inventory/inventoryStorage'
import { SESSION_KEY, isSession, parseSessions, sessionStore } from '../sessions/sessionStore'
import { markBackupCreated } from './backupStatus'
import { downloadJson } from './downloadJson'
import { SPOT_KEY } from './storageKeys'
import { type FishingSpot, isSpot, parseSpots, spotStore } from '../spots/spotStore'
import { storageSnapshot, writeDataTransaction, type StorageSnapshot } from './storageTransaction'

export interface BackupData {
  inventory: InventoryItem[]
  sessions: FishingSession[]
  spots: FishingSpot[]
  exportedAt: string
  hasRecoveryData: boolean
}
export interface RestorePlan {
  before: StorageSnapshot
  after: StorageSnapshot
  addedSessions: number
  skippedSessions: number
  archivedSessions: number
  addedSizes: number
  addedSpots: number
}

export function serializeBackup(): string {
  const originalStorage: Record<string, string | null> = { ...storageSnapshot() }
  for (const key of LEGACY_INVENTORY_KEYS) originalStorage[key] = localStorage.getItem(key)
  let inventory: InventoryItem[] = [],
    sessions: FishingSession[] = [],
    spots: FishingSpot[] = []
  try {
    inventory = loadInventory().items
  } catch {
    /* raw data is included below */
  }
  try {
    sessions = parseSessions(originalStorage[SESSION_KEY] ?? '{"schemaVersion":1,"sessions":[]}').sessions
  } catch {
    /* raw data is included below */
  }
  try {
    spots = parseSpots(originalStorage[SPOT_KEY] ?? '{"schemaVersion":1,"spots":[]}').spots
  } catch {
    /* raw data is included below */
  }
  return JSON.stringify(
    {
      app: 'Angelkompass',
      format: 'full-backup',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      inventory,
      sessions,
      spots,
      originalStorage,
    },
    null,
    2,
  )
}

const backupFilename = () => `angelkompass-sicherung-${new Date().toISOString().slice(0, 10)}.json`

export function downloadBackup() {
  downloadJson(serializeBackup(), backupFilename())
  markBackupCreated()
}

/** True when the system share sheet accepts a JSON file (e.g. „In Dateien sichern“ on iOS). */
export function canShareBackup() {
  try {
    return (
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File(['{}'], 'probe.json', { type: 'application/json' })] })
    )
  } catch {
    return false
  }
}

/** Opens the share sheet with the full backup. Resolves false when the user closes the sheet. */
export async function shareBackup(): Promise<boolean> {
  const file = new File([serializeBackup()], backupFilename(), { type: 'application/json' })
  try {
    await navigator.share({ files: [file], title: 'Angelkompass-Sicherung' })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') return false
    throw cause
  }
  markBackupCreated()
  return true
}

export function parseBackup(raw: string): BackupData {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('Die Datei enthält kein gültiges JSON. Bitte eine Angelkompass-Sicherung auswählen.')
  }
  if (
    !isRecord(value) ||
    value.app !== 'Angelkompass' ||
    value.schemaVersion !== 1 ||
    typeof value.exportedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.exportedAt)) ||
    !Array.isArray(value.sessions) ||
    !value.sessions.every(isSession)
  )
    throw new Error('Das ist keine gültige Angelkompass-Sicherung oder sie enthält beschädigte Sessions.')
  if (value.format !== undefined && value.format !== 'full-backup')
    throw new Error('Dieses Sicherungsformat wird noch nicht unterstützt.')
  const inventory: unknown = value.format === 'full-backup' ? value.inventory : []
  if (!Array.isArray(inventory) || !inventory.every(isInventoryItem))
    throw new Error('Die Sicherung enthält ungültige Köderangaben.')
  if (new Set(value.sessions.map(session => session.id)).size !== value.sessions.length)
    throw new Error('Die Sicherung enthält doppelte Session-IDs.')
  // Backups created before spots existed simply have no spot list.
  const spots: unknown = value.format === 'full-backup' && value.spots !== undefined ? value.spots : []
  if (!Array.isArray(spots) || !spots.every(isSpot) || new Set(spots.map(spot => spot.id)).size !== spots.length)
    throw new Error('Die Sicherung enthält ungültige Angelstellen.')
  let hasRecoveryData = false
  if (isRecord(value.originalStorage)) {
    for (const [key, parse] of [
      [INVENTORY_KEY, parseInventory],
      [SESSION_KEY, parseSessions],
      [SPOT_KEY, parseSpots],
    ] as const) {
      const original = value.originalStorage[key]
      if (typeof original !== 'string') continue
      try {
        if (parse(original).retained.length) hasRecoveryData = true
      } catch {
        hasRecoveryData = true
      }
    }
  }
  return {
    inventory: mergeInventory(inventory),
    sessions: value.sessions,
    spots,
    exportedAt: value.exportedAt,
    hasRecoveryData,
  }
}

/** Merge additions only. Local snapshots win conflicts; a running plan keeps its status. */
export function planRestore(backup: BackupData): RestorePlan {
  const before = storageSnapshot()
  const inventory = loadInventory()
  const local = parseSessions(before[SESSION_KEY] ?? '{"schemaVersion":1,"sessions":[]}')
  const mergedInventory = mergeInventory([...inventory.items, ...backup.inventory])
  const sizes = (items: InventoryItem[]) => items.reduce((sum, item) => sum + item.sizes.length, 0)
  // Include IDs of retained records so an import cannot shadow unreadable local data.
  const ids = new Set(
    [...local.sessions, ...local.retained].flatMap(item =>
      isRecord(item) && typeof item.id === 'string' ? [item.id] : [],
    ),
  )
  const sessions = [...local.sessions]
  let active = sessions.some(session => session.status === 'active')
  let addedSessions = 0,
    skippedSessions = 0,
    archivedSessions = 0
  for (const session of backup.sessions) {
    if (ids.has(session.id)) {
      skippedSessions++
      continue
    }
    ids.add(session.id)
    if (session.status === 'active' && active) {
      sessions.push({ ...session, status: 'completed', completedAt: session.updatedAt })
      archivedSessions++
    } else {
      sessions.push(session)
      if (session.status === 'active') active = true
    }
    addedSessions++
  }
  const localSpots = parseSpots(before[SPOT_KEY] ?? '{"schemaVersion":1,"spots":[]}')
  const spotIds = new Set(
    [...localSpots.spots, ...localSpots.retained].flatMap(item =>
      isRecord(item) && typeof item.id === 'string' ? [item.id] : [],
    ),
  )
  const newSpots = backup.spots.filter(spot => !spotIds.has(spot.id))
  return {
    before,
    after: {
      [INVENTORY_KEY]: JSON.stringify({ schemaVersion: 3, items: [...mergedInventory, ...inventory.retained] }),
      [SESSION_KEY]: JSON.stringify({ schemaVersion: 1, sessions: [...sessions, ...local.retained] }),
      [SPOT_KEY]: newSpots.length
        ? JSON.stringify({ schemaVersion: 1, spots: [...localSpots.spots, ...newSpots, ...localSpots.retained] })
        : before[SPOT_KEY],
    },
    addedSpots: newSpots.length,
    addedSessions,
    skippedSessions,
    archivedSessions,
    addedSizes: sizes(mergedInventory) - sizes(inventory.items),
  }
}

export function restoreBackup(plan: RestorePlan) {
  try {
    writeDataTransaction(plan.before, plan.after)
  } finally {
    window.dispatchEvent(new Event('angelkompass:inventory'))
    sessionStore.refresh()
    spotStore.refresh()
  }
}
