import { markPersistRequested, readBackupStatus } from './backupStatus'

export type PersistenceState = 'persisted' | 'best-effort' | 'unsupported'

const storageManager = () => (typeof navigator !== 'undefined' ? navigator.storage : undefined)

/** Whether the browser has promised not to evict this app's data under storage pressure. */
export async function persistenceState(): Promise<PersistenceState> {
  const storage = storageManager()
  if (!storage?.persisted || !storage.persist) return 'unsupported'
  try {
    return (await storage.persisted()) ? 'persisted' : 'best-effort'
  } catch {
    return 'unsupported'
  }
}

/** Asks the browser for durable storage. Chrome and Safari decide silently; Firefox may ask the user. */
export async function requestPersistence(): Promise<PersistenceState> {
  const storage = storageManager()
  if (!storage?.persist) return 'unsupported'
  try {
    markPersistRequested()
    return (await storage.persist()) ? 'persisted' : 'best-effort'
  } catch {
    return 'unsupported'
  }
}

/** Requests durable storage once, after the user has saved real data (a started session). */
export function requestPersistenceOnce() {
  if (readBackupStatus().persistRequestedAt) return
  void persistenceState().then(state => {
    if (state === 'best-effort') void requestPersistence()
  })
}
