import type { Conditions, LureType } from '../models/types'

/**
 * True when no depth-compatible presentation of the lure is meant for the observed weed situation.
 * Unknown vegetation stays neutral.
 */
export function lacksVegetationProfile(catalog: LureType[], conditions: Conditions, lureId: string) {
  if (conditions.vegetation === 'unknown') return false
  const lure = catalog.find(item => item.id === lureId)
  if (!lure?.presentations?.length) return false
  return !lure.presentations.some(
    profile =>
      (conditions.depth === 'unknown' || profile.depths.includes(conditions.depth)) &&
      profile.vegetation.includes(conditions.vegetation),
  )
}
