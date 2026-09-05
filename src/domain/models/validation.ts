import type { Conditions } from './types'

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
export const oneOf = (value: unknown, values: readonly string[]) =>
  typeof value === 'string' && values.includes(value)

/** Validate persisted and router-provided observations before invoking the engine. */
export function isConditions(value: unknown): value is Conditions {
  if (!isRecord(value) || !isRecord(value.activity)) return false
  return oneOf(value.targetFish, ['perch', 'pike']) && value.waterType === 'lake' &&
    oneOf(value.season, ['spring', 'summer', 'autumn', 'winter']) &&
    oneOf(value.timeOfDay, ['dawn', 'day', 'dusk', 'night', 'unknown']) &&
    oneOf(value.turbidity, ['clear', 'slightly_turbid', 'turbid', 'unknown']) &&
    oneOf(value.depth, ['shallow', 'medium', 'deep', 'unknown']) &&
    oneOf(value.waterTemperature, ['cold', 'cool', 'mild', 'warm', 'hot', 'unknown']) &&
    oneOf(value.light, ['bright', 'diffuse', 'dark', 'unknown']) &&
    oneOf(value.vegetation, ['none', 'edgeOrGaps', 'dense', 'unknown']) &&
    Array.isArray(value.observedStructure) && value.observedStructure.every(item => oneOf(item, ['shallow', 'dropoff', 'hardCover'])) &&
    (value.structureStatus === undefined || oneOf(value.structureStatus, ['unknown', 'none', 'observed'])) &&
    oneOf(value.activity.status, ['unknown', 'none', 'observed']) &&
    Array.isArray(value.activity.signs) && value.activity.signs.every(item => oneOf(item, ['baitfish', 'huntingPerch', 'surfaceActivity', 'pikeContact'])) &&
    (value.pikeSafetyConfirmed === undefined || typeof value.pikeSafetyConfirmed === 'boolean')
}

export function canRecommend(value: unknown): value is Conditions {
  return isConditions(value) && (value.targetFish !== 'pike' || value.pikeSafetyConfirmed === true)
}
