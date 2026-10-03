import { useSyncExternalStore } from 'react'
import type { FishingSession } from '../../domain/models/types'
import { isRecord } from '../../domain/models/validation'
import type { FishingSpot } from '../spots/spotStore'
import { BACKUP_STATUS_KEY } from './storageKeys'

/** Device-local reminder state. Like other UI preferences it is not part of the backup itself. */
export interface BackupStatus {
  lastBackupAt?: string
  snoozedUntil?: string
  persistRequestedAt?: string
}

export const REMINDER_AFTER_ENTRIES = 3
export const REMINDER_AFTER_DAYS = 30
export const SNOOZE_DAYS = 7
const DAY = 24 * 60 * 60 * 1000

const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cached: BackupStatus = {}

const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value))

export function readBackupStatus(): BackupStatus {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(BACKUP_STATUS_KEY)
  } catch {
    /* storage unavailable: no reminder state */
  }
  if (raw === cachedRaw) return cached
  cachedRaw = raw
  cached = {}
  try {
    const value: unknown = raw ? JSON.parse(raw) : {}
    if (isRecord(value))
      for (const key of ['lastBackupAt', 'snoozedUntil', 'persistRequestedAt'] as const)
        if (validDate(value[key])) cached[key] = value[key]
  } catch {
    /* unreadable state is treated as empty */
  }
  return cached
}

function update(change: Partial<BackupStatus>) {
  try {
    localStorage.setItem(BACKUP_STATUS_KEY, JSON.stringify({ ...readBackupStatus(), ...change }))
  } catch {
    /* reminder state is optional */
  }
  listeners.forEach(listener => listener())
}

export const markBackupCreated = (now = new Date()) =>
  update({ lastBackupAt: now.toISOString(), snoozedUntil: undefined })
export const snoozeBackupReminder = (now = new Date()) =>
  update({ snoozedUntil: new Date(now.getTime() + SNOOZE_DAYS * DAY).toISOString() })
export const markPersistRequested = (now = new Date()) => update({ persistRequestedAt: now.toISOString() })

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === BACKUP_STATUS_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const useBackupStatus = () => useSyncExternalStore(subscribe, readBackupStatus)

export interface BackupReminder {
  /** Sessions and fishing spots created or changed since the last full backup. */
  unsaved: number
  neverBackedUp: boolean
}

/** A reminder is due after several unsaved entries, or after a month with at least one unsaved entry. */
export function backupReminder(
  status: BackupStatus,
  sessions: FishingSession[],
  spots: FishingSpot[],
  now = new Date(),
): BackupReminder | undefined {
  if (status.snoozedUntil && Date.parse(status.snoozedUntil) > now.getTime()) return undefined
  const since = status.lastBackupAt ? Date.parse(status.lastBackupAt) : undefined
  const changed = (date: string) => since === undefined || Date.parse(date) > since
  const unsaved =
    sessions.filter(session => changed(session.updatedAt)).length + spots.filter(spot => changed(spot.updatedAt)).length
  if (!unsaved) return undefined
  const old = since !== undefined && now.getTime() - since > REMINDER_AFTER_DAYS * DAY
  return unsaved >= REMINDER_AFTER_ENTRIES || old ? { unsaved, neverBackedUp: since === undefined } : undefined
}
