import { describe, expect, it } from 'vitest'
import { createRecommendationDecision, createRecommendations, evaluateSetups, evaluateSpots } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'

const base: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'summer', timeOfDay: 'day', turbidity: 'slightly_turbid', depth: 'medium', observedStructure: [] }
const scenarios: Array<{ name: string; conditions: Conditions; expectedSpot?: string; allowedTopLures?: string[] }> = [
  { name: 'klarer Sommersee an Kraut', conditions: { ...base, turbidity: 'clear', depth: 'shallow', observedStructure: ['vegetation'] }, expectedSpot: 'vegetation', allowedTopLures: ['ned', 'twitchbait'] },
  { name: 'trüber Sommersee im Flachen', conditions: { ...base, turbidity: 'turbid', depth: 'shallow', observedStructure: ['shallow'] }, expectedSpot: 'shallow', allowedTopLures: ['twitchbait', 'spinner'] },
  { name: 'kalter Wintersee an tiefer Kante', conditions: { ...base, season: 'winter', depth: 'deep', observedStructure: ['dropoff'] }, expectedSpot: 'dropoff', allowedTopLures: ['drop-shot'] },
  { name: 'Herbstsee an Tiefenkante', conditions: { ...base, season: 'autumn', depth: 'deep', observedStructure: ['dropoff'] }, expectedSpot: 'dropoff', allowedTopLures: ['jig', 'drop-shot'] },
  { name: 'Frühjahrssee am Schilf', conditions: { ...base, season: 'spring', depth: 'shallow', observedStructure: ['vegetation'] }, expectedSpot: 'vegetation' },
  { name: 'Abendliches Flachwasser', conditions: { ...base, timeOfDay: 'dusk', depth: 'shallow', observedStructure: ['shallow'] }, expectedSpot: 'shallow' },
  { name: 'Morgendliches Flachwasser', conditions: { ...base, timeOfDay: 'dawn', depth: 'shallow', observedStructure: ['shallow'] }, expectedSpot: 'shallow' },
  { name: 'Klare mittlere Tiefe ohne Struktur', conditions: { ...base, turbidity: 'clear' }, allowedTopLures: ['ned', 'drop-shot'] },
  { name: 'Trübes mittleres Wasser ohne Struktur', conditions: { ...base, turbidity: 'turbid' }, allowedTopLures: ['twitchbait', 'spinner'] },
  { name: 'Unbekannte Beobachtungen', conditions: { ...base, timeOfDay: 'unknown', turbidity: 'unknown', depth: 'unknown' } },
  { name: 'Tiefe Zone ohne sichtbare Struktur', conditions: { ...base, depth: 'deep' }, expectedSpot: 'dropoff' },
  { name: 'Krautkante in mittlerer Tiefe', conditions: { ...base, observedStructure: ['vegetation'] }, expectedSpot: 'vegetation' },
]

describe('12 festgelegte See-Szenarien', () => {
  it.each(scenarios)('$name', ({ conditions, expectedSpot, allowedTopLures }) => {
    const recommendations = createRecommendations(conditions)
    expect(recommendations).toHaveLength(3)
    expect(recommendations.every((item) => item.reasons.length > 0)).toBe(true)
    expect(recommendations.every((item) => item.noBiteAlternative.length > 20)).toBe(true)
    if (expectedSpot) expect(recommendations[0].spot.spot.id).toBe(expectedSpot)
    if (allowedTopLures) expect(allowedTopLures).toContain(recommendations[0].setup.lure.id)
  })
})

describe('Engine-Invarianten', () => {
  it('ist für identische Eingaben deterministisch', () => expect(createRecommendations(base)).toEqual(createRecommendations(base)))
  it('hält alle Scores zwischen 0 und 100', () => {
    const spotScores = evaluateSpots(base)
    const setupScores = evaluateSetups(base, spotScores[0])
    expect([...spotScores, ...setupScores].every((item) => item.score >= 0 && item.score <= 100)).toBe(true)
  })
  it('trennt die drei primären Ködertypen', () => expect(new Set(createRecommendations(base).map((item) => item.setup.lure.id)).size).toBe(3))
  it('verändert die fachliche Rangfolge durch Bestand nicht', () => {
    const withoutInventory = createRecommendationDecision(base, [])
    const withInventory = createRecommendationDecision(base, [{ lureTypeId: 'spinner' }])
    expect(withInventory.expertRanking).toEqual(withoutInventory.expertRanking)
  })
  it('wählt die beste vorhandene Option nach fachlichem Score', () => {
    const decision = createRecommendationDecision({ ...base, turbidity: 'clear' }, [{ lureTypeId: 'spinner' }, { lureTypeId: 'drop-shot' }])
    expect(decision.practicalPrimary?.setup.lure.id).toBe('drop-shot')
  })
  it('kennzeichnet die beste fehlende Option getrennt', () => {
    const decision = createRecommendationDecision({ ...base, turbidity: 'clear' }, [{ lureTypeId: 'spinner' }])
    expect(decision.bestMissing?.setup.lure.id).not.toBe('spinner')
    expect(decision.practicalPrimary?.setup.lure.id).toBe('spinner')
  })
  it('warnt bei deutlich schlechterer vorhandener Option', () => {
    const decision = createRecommendationDecision({ ...base, season: 'winter', turbidity: 'clear' }, [{ lureTypeId: 'spinner' }])
    expect(decision.suitabilityGap).toBeGreaterThanOrEqual(8)
    expect(decision.suitabilityWarning).toBeTruthy()
  })
})
