import { INVENTORY_KEY, SESSION_KEY, RESTORE_JOURNAL_KEY } from './storageKeys'
import { isRecord } from '../../domain/models/validation'

export const DATA_KEYS = [INVENTORY_KEY, SESSION_KEY] as const
export type DataKey = (typeof DATA_KEYS)[number]
export type StorageSnapshot = Record<DataKey, string | null>
const JOURNAL_KEY = RESTORE_JOURNAL_KEY

export function assertStorageReady() {
  if (localStorage.getItem(JOURNAL_KEY) !== null)
    throw new Error(
      'Eine Wiederherstellung ist noch offen. Bitte kurz warten oder die App erneut öffnen, bevor du Daten änderst.',
    )
}

export function storageSnapshot(): StorageSnapshot {
  assertStorageReady()
  return { [INVENTORY_KEY]: localStorage.getItem(INVENTORY_KEY), [SESSION_KEY]: localStorage.getItem(SESSION_KEY) }
}

/** A write-ahead rollback journal also covers a tab closing between the two writes. */
export function recoverPendingRestore(): void {
  let raw: string | null
  try {
    raw = localStorage.getItem(JOURNAL_KEY)
  } catch {
    return
  }
  if (raw === null) return
  const journal: unknown = JSON.parse(raw)
  if (!isRecord(journal) || journal.schemaVersion !== 1 || !isRecord(journal.before))
    throw new Error('Die unterbrochene Wiederherstellung ist nicht lesbar.')
  const before = journal.before
  if (!DATA_KEYS.every(key => before[key] === null || typeof before[key] === 'string'))
    throw new Error('Die unterbrochene Wiederherstellung ist unvollständig.')
  for (const key of DATA_KEYS) {
    const value = before[key]
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value as string)
  }
  localStorage.removeItem(JOURNAL_KEY)
}

export function writeDataTransaction(before: StorageSnapshot, after: StorageSnapshot): void {
  assertStorageReady()
  if (DATA_KEYS.some(key => localStorage.getItem(key) !== before[key]))
    throw new Error('Deine Daten wurden inzwischen geändert. Prüfe die Vorschau erneut.')
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify({ schemaVersion: 1, before }))
  } catch {
    throw new Error(
      'Die Rücksicherung konnte nicht gespeichert werden. Prüfe den verfügbaren Browser-Speicher. Deine Daten wurden nicht geändert.',
    )
  }
  try {
    for (const key of DATA_KEYS) {
      const value = after[key]
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    }
    localStorage.removeItem(JOURNAL_KEY)
  } catch {
    try {
      recoverPendingRestore()
    } catch {
      throw new Error(
        'Der Speicher ist nicht verfügbar. Die Wiederherstellung wird beim nächsten Öffnen zurückgesetzt. Bitte die App erneut öffnen, sobald Speicher verfügbar ist.',
      )
    }
    throw new Error(
      'Nicht genügend verfügbarer Speicher. Die Wiederherstellung wurde zurückgesetzt; deine bisherigen Daten bleiben erhalten.',
    )
  }
}
