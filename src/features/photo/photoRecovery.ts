import type { Conditions } from '../../domain/models/types'
import { isConditions, isRecord } from '../../domain/models/validation'

const key = 'angelkompass.photo-attempt.v1'
// Only an interrupted attempt's form values; never image pixels or metadata.
export function readPhotoAttempt(): Conditions | undefined {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (!isRecord(value) || typeof value.started !== 'number' || Date.now()-value.started < 0 || Date.now()-value.started > 30*60_000 || !isConditions(value.conditions)) return
    return value.conditions
  } catch { return }
}
export function beginPhotoAttempt(conditions: Conditions) {
  try { sessionStorage.setItem(key, JSON.stringify({ started:Date.now(), conditions })) } catch { /* Optional recovery when storage is unavailable. */ }
}
export function clearPhotoAttempt() {
  try { sessionStorage.removeItem(key) } catch { /* Private browsing may disallow storage. */ }
}
