import { describe, expect, it } from 'vitest'
import { createRecommendations, evaluateSetups, evaluateSpots } from '../../domain/engine/scoring'
import type { Conditions, Recommendation } from '../../domain/models/types'

const base: Conditions = {
  targetFish: 'perch',
  waterType: 'lake',
  season: 'summer',
  timeOfDay: 'day',
  turbidity: 'slightly_turbid',
  depth: 'medium',
  waterTemperature: 'mild',
  light: 'diffuse',
  activity: { status: 'unknown', signs: [] },
  vegetation: 'dense',
  observedStructure: [],
  pikeSafetyConfirmed: true,
}
const profileFits = (recommendation: Recommendation, conditions: Conditions) =>
  recommendation.setup.lure.presentations
    ?.find(item => item.id === recommendation.setup.resolvedPresentation?.profileId)
    ?.vegetation.includes(conditions.vegetation)
const reasonCodes = (conditions: Conditions, lureId: string, spotId = 'dropoff') => {
  const spot = evaluateSpots(conditions).find(item => item.spot.id === spotId)!
  return evaluateSetups(conditions, spot)
    .find(item => item.lure.id === lureId)!
    .reasons.map(item => item.reasonCode)
}

describe('Montage passend zur Krautlage', () => {
  it.each<[string, Conditions]>([
    ['Barsch, Tiefenkante im dichten Kraut', { ...base, observedStructure: ['dropoff'] }],
    ['Barsch, flach im dichten Kraut', { ...base, depth: 'shallow', observedStructure: ['shallow'] }],
    ['Hecht, flach im dichten Kraut', { ...base, targetFish: 'pike', depth: 'shallow' }],
    ['Hecht, mittel im dichten Kraut', { ...base, targetFish: 'pike', observedStructure: ['shallow'] }],
  ])('%s: Platz 1 nutzt ein krauttaugliches Profil', (_, conditions) => {
    expect(profileFits(createRecommendations(conditions)[0], conditions)).toBe(true)
  })

  it('wertet Köder ohne passendes Profil ab und lässt unbekanntes Kraut neutral', () => {
    const crank = { ...base, observedStructure: ['dropoff'] } satisfies Conditions
    expect(reasonCodes(crank, 'crankbait')).toContain('VEGETATION_RIG_MISMATCH')
    // In the vegetation spot the existing dense-weed rule grades the crankbait without stacking.
    expect(reasonCodes(crank, 'crankbait', 'vegetation')).toEqual(
      expect.not.arrayContaining(['VEGETATION_RIG_MISMATCH']),
    )
    expect(reasonCodes({ ...crank, vegetation: 'unknown' }, 'crankbait')).not.toContain('VEGETATION_RIG_MISMATCH')
    expect(reasonCodes({ ...base, targetFish: 'pike', depth: 'shallow' }, 'jerkbait')).toContain(
      'PIKE_VEGETATION_RIG_MISMATCH',
    )
  })

  it('führt Spinnerbaits auch im krautfreien Wasser ohne Abwertung', () => {
    for (const targetFish of ['perch', 'pike'] as const) {
      const conditions = { ...base, targetFish, vegetation: 'none', depth: 'shallow' } satisfies Conditions
      const codes = reasonCodes(conditions, 'spinnerbait', 'shallow')
      expect(codes.some(code => code.endsWith('VEGETATION_RIG_MISMATCH'))).toBe(false)
    }
  })
})
