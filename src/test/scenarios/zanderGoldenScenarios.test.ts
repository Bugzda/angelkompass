import { describe, expect, it } from 'vitest'
import { createRecommendationDecision, evaluateSetups, evaluateSpots } from '../../domain/engine/scoring'
import type { Conditions, InventoryItem } from '../../domain/models/types'

const base: Conditions = {
  targetFish: 'zander',
  waterType: 'lake',
  season: 'summer',
  timeOfDay: 'day',
  turbidity: 'slightly_turbid',
  depth: 'medium',
  waterTemperature: 'mild',
  light: 'diffuse',
  activity: { status: 'none', signs: [] },
  vegetation: 'none',
  observedStructure: [],
}
const fullBox: InventoryItem[] = (['jig', 'dropshot', 'carolina', 'twitchbait'] as const).map(lureTypeId => ({
  targetFish: 'zander',
  lureTypeId,
  sizes: ['small', 'medium', 'large'],
}))
type Scenario = { name: string; conditions: Conditions; expectedSpot?: string; allowedTopLures?: string[] }
const scenarios: Scenario[] = [
  {
    name: 'kalter Winter an bestätigter tiefer Kante',
    conditions: { ...base, season: 'winter', waterTemperature: 'cold', depth: 'deep', observedStructure: ['dropoff'] },
    expectedSpot: 'dropoff',
    allowedTopLures: ['jig', 'dropshot', 'carolina'],
  },
  {
    name: 'Nacht in der flachen Uferzone',
    conditions: { ...base, timeOfDay: 'night', light: 'dark', depth: 'shallow', observedStructure: ['shallow'] },
    expectedSpot: 'shallow',
    allowedTopLures: ['twitchbait'],
  },
  {
    name: 'heller Tag in klarem Wasser an der Kante',
    conditions: { ...base, light: 'bright', turbidity: 'clear', depth: 'deep', observedStructure: ['dropoff'] },
    expectedSpot: 'dropoff',
    allowedTopLures: ['jig', 'dropshot', 'carolina'],
  },
  {
    name: 'bestätigte Steinpackung',
    conditions: { ...base, observedStructure: ['hardCover'] },
    expectedSpot: 'hardCover',
    allowedTopLures: ['jig', 'carolina'],
  },
  {
    name: 'dichtes Kraut',
    conditions: { ...base, vegetation: 'dense', observedStructure: ['dropoff'] },
    allowedTopLures: ['jig'],
  },
  {
    name: 'bestätigter Zanderkontakt',
    conditions: { ...base, activity: { status: 'observed', signs: ['zanderContact'] }, observedStructure: ['dropoff'] },
    allowedTopLures: ['jig', 'dropshot'],
  },
  {
    name: 'vollständig unbekannte Angaben',
    conditions: {
      ...base,
      timeOfDay: 'unknown',
      turbidity: 'unknown',
      depth: 'unknown',
      waterTemperature: 'unknown',
      light: 'unknown',
      activity: { status: 'unknown', signs: [] },
      vegetation: 'unknown',
    },
  },
]

describe(`${scenarios.length} Zander-Szenarien am See`, () => {
  it.each(scenarios)('$name', ({ conditions, expectedSpot, allowedTopLures }) => {
    const decision = createRecommendationDecision(conditions, fullBox)
    expect(decision.expertRanking).toHaveLength(3)
    expect(decision.practicalPrimary).toBeDefined()
    expect(decision.practicalPrimary!.switchPlan).toHaveLength(3)
    if (expectedSpot) expect(decision.practicalPrimary!.spot.spot.id).toBe(expectedSpot)
    if (allowedTopLures) expect(allowedTopLures).toContain(decision.practicalPrimary!.setup.lure.id)
  })
})

describe('Freier Wasserbereich beim Zander', () => {
  it('wird bei sichtbarem Kleinfisch zum begründeten Suchbereich', () => {
    const conditions = { ...base, activity: { status: 'observed', signs: ['baitfish'] } } satisfies Conditions
    const primary = createRecommendationDecision(conditions, fullBox).practicalPrimary!
    expect(primary.spot.spot.label).toBe('Freier Wasserbereich')
    expect(primary.spot.reasons.map(item => item.reasonCode)).toContain('ZANDER_PREY')
  })

  it('bleibt nach bestätigter Kante das Ziel für den Spotwechsel', () => {
    const conditions = {
      ...base,
      activity: { status: 'observed', signs: ['baitfish'] },
      observedStructure: ['dropoff'],
    } satisfies Conditions
    const primary = createRecommendationDecision(conditions, fullBox).practicalPrimary!
    expect(primary.spot.spot.id).toBe('dropoff')
    expect(primary.switchPlan.find(step => step.phase === 'move')?.setup?.spotLabel).toBe('Freier Wasserbereich')
  })

  it('nutzt ohne Kleinfisch weiterhin den neutralen Wasserbereich ohne Begründung', () => {
    const primary = createRecommendationDecision(base, fullBox).practicalPrimary!
    expect(primary.spot.spot.label).toBe('Freier Bereich mittlerer Tiefe')
    expect(primary.spot.reasons).toHaveLength(0)
  })

  it('wertet Drop Shot, Carolina und Wobbler im dichten Kraut ab', () => {
    const conditions = { ...base, vegetation: 'dense' } satisfies Conditions
    const spot = evaluateSpots(conditions)[0]
    const setups = evaluateSetups(conditions, spot)
    expect(setups[0].lure.id).toBe('jig')
    expect(setups[0].resolvedPresentation?.profileId).toBe('zander-texas')
  })
})
