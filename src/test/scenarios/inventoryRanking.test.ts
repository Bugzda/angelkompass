import { describe, expect, it } from 'vitest'
import { createRecommendationDecision, isRecommendationAvailable } from '../../domain/engine/scoring'
import type { Conditions, InventoryItem, SizeClass, TargetFish } from '../../domain/models/types'
import { profileFor } from '../../domain/species/profiles'

const conditionsFor = (
  targetFish: TargetFish,
  depth: Conditions['depth'],
  waterTemperature: Conditions['waterTemperature'] = 'mild',
): Conditions => ({
  targetFish,
  waterType: 'lake',
  season: 'summer',
  timeOfDay: 'day',
  turbidity: 'slightly_turbid',
  depth,
  waterTemperature,
  light: 'diffuse',
  activity: { status: 'none', signs: [] },
  vegetation: 'none',
  observedStructure: [],
  structureStatus: 'none',
  pikeSafetyConfirmed: targetFish === 'pike' ? true : undefined,
})

const inventoryFor = (fish: TargetFish, depth: Conditions['depth'], count: number): InventoryItem[] =>
  profileFor(fish)
    .lures.filter(lure => depth === 'unknown' || lure.depths.includes(depth))
    .slice(0, count)
    .map(lure => ({ targetFish: fish, lureTypeId: lure.id, sizes: [...lure.sizes] }))

describe('bestandsbasierte Top-Empfehlungen', () => {
  for (const fish of ['perch', 'pike', 'zander'] as const)
    for (const depth of ['shallow', 'medium', 'deep', 'unknown'] as const)
      for (const count of [0, 1, 2, 3]) {
        it(`${fish} ${depth}: zeigt ${count} vorhandene Optionen`, () => {
          const conditions = conditionsFor(fish, depth)
          const decision = createRecommendationDecision(conditions, inventoryFor(fish, depth, count))
          expect(decision.practicalRanking).toHaveLength(count)
          expect(new Set(decision.practicalRanking.map(item => item.setup.lure.id)).size).toBe(count)
          expect(
            decision.practicalRanking.every(item =>
              isRecommendationAvailable(conditions, inventoryFor(fish, depth, count), item),
            ),
          ).toBe(true)
          for (const recommendation of decision.practicalRanking)
            for (const step of recommendation.switchPlan) {
              const setup = step.setup!
              expect(setup).toBeDefined()
              expect(
                inventoryFor(fish, depth, count).some(
                  item => item.lureTypeId === setup.lureId && item.sizes.includes(setup.size),
                ),
              ).toBe(true)
              expect(decision.practicalRanking.some(item => item.setup.lure.id === setup.lureId)).toBe(true)
            }
          const compatibleCount = profileFor(fish).lures.filter(
            lure => depth === 'unknown' || lure.depths.includes(depth),
          ).length
          if (count < compatibleCount) expect(decision.optionalLureTip).toBeDefined()
          else expect(decision.optionalLureTip).toBeUndefined()
        })
      }

  it.each([
    {
      name: 'bevorzugt mittel und nutzt klein vor groß',
      conditions: conditionsFor('perch', 'medium', 'warm'),
      sizes: ['small', 'large'] as SizeClass[],
      expected: 'small',
    },
    {
      name: 'bevorzugt klein und nutzt mittel',
      conditions: conditionsFor('perch', 'medium', 'cold'),
      sizes: ['medium'] as SizeClass[],
      expected: 'medium',
    },
    {
      name: 'bevorzugt groß und nutzt mittel',
      conditions: conditionsFor('pike', 'medium', 'warm'),
      sizes: ['medium'] as SizeClass[],
      expected: 'medium',
    },
  ])('$name', ({ conditions, sizes, expected }) => {
    const inventory: InventoryItem[] = [{ targetFish: conditions.targetFish, lureTypeId: 'jig', sizes }]
    const result = createRecommendationDecision(conditions, inventory).practicalRanking.find(
      item => item.setup.lure.id === 'jig',
    )!
    expect(result.setup.size).toBe(expected)
    expect(result.inventoryFit).toEqual({
      preferredSize:
        conditions.targetFish === 'pike' ? 'large' : conditions.waterTemperature === 'cold' ? 'small' : 'medium',
      selectedSize: expected,
      exact: false,
    })
    expect(result.switchPlan[1].change).toContain(result.setup.lure.label)
  })

  it('behält eine exakt vorhandene Größe ohne Kompromiss', () => {
    const conditions = conditionsFor('perch', 'deep', 'warm')
    const result = createRecommendationDecision(conditions, [
      { targetFish: 'perch', lureTypeId: 'jig', sizes: ['medium'] },
    ]).practicalRanking[0]
    expect(result.inventoryFit).toEqual({ preferredSize: 'medium', selectedSize: 'medium', exact: true })
  })

  it('zeigt bei vollständigem Bestand keinen vorhandenen Köder als fehlende Ergänzung', () => {
    const conditions = conditionsFor('perch', 'medium')
    const inventory: InventoryItem[] = profileFor('perch').lures.map(lure => ({
      targetFish: 'perch',
      lureTypeId: lure.id,
      sizes: [...lure.sizes],
    }))
    expect(createRecommendationDecision(conditions, inventory).optionalLureTip).toBeUndefined()
  })

  it('unterdrückt Spot-Tipps nach der expliziten Auswahl keine weitere Struktur', () => {
    const none = createRecommendationDecision(conditionsFor('pike', 'medium'), [])
    const unknown = createRecommendationDecision({ ...conditionsFor('pike', 'medium'), structureStatus: 'unknown' }, [])
    expect(none.optionalSpotTip).toBeUndefined()
    expect(unknown.optionalSpotTip).toBeDefined()
  })

  it('berechnet das Wechselziel relativ zum Spot jeder Empfehlung', () => {
    const conditions: Conditions = {
      ...conditionsFor('pike', 'shallow', 'warm'),
      structureStatus: 'observed',
      observedStructure: ['shallow', 'hardCover'],
    }
    const inventory: InventoryItem[] = profileFor('pike')
      .lures.filter(lure => lure.id === 'jig' || lure.id === 'popper')
      .map(lure => ({ targetFish: 'pike', lureTypeId: lure.id, sizes: [...lure.sizes] }))
    const ranking = createRecommendationDecision(conditions, inventory).practicalRanking
    expect(new Set(ranking.map(item => item.spot.spot.id)).size).toBeGreaterThan(1)
    for (const item of ranking)
      expect(item.switchPlan.find(step => step.phase === 'move')?.change).not.toContain(`: ${item.spot.spot.label}.`)
    for (const item of ranking) {
      expect(item.switchPlan[1].setup?.spotLabel).toBe(item.spot.spot.label)
      expect(item.switchPlan[2].setup?.spotLabel).not.toBe(item.spot.spot.label)
      expect(item.switchPlan[2].setup?.presentation).toEqual(item.switchPlan[1].setup?.presentation)
    }
  })

  it('wechselt vom Twitchbait zum vorhandenen Gummifisch, auch wenn ein Spinner höher gerankt ist', () => {
    const conditions: Conditions = {
      ...conditionsFor('perch', 'shallow', 'warm'),
      turbidity: 'clear',
      light: 'bright',
      activity: { status: 'observed', signs: ['huntingPerch'] },
      observedStructure: ['shallow'],
      structureStatus: 'observed',
    }
    const inventory: InventoryItem[] = [
      { targetFish: 'perch', lureTypeId: 'twitchbait', sizes: ['medium'] },
      { targetFish: 'perch', lureTypeId: 'spinner', sizes: ['medium'] },
      { targetFish: 'perch', lureTypeId: 'jig', sizes: ['small'] },
    ]
    const decision = createRecommendationDecision(conditions, inventory)
    expect(decision.practicalRanking.map(item => item.setup.lure.id)).toEqual(['twitchbait', 'spinner', 'jig'])
    const step = decision.practicalRanking[0].switchPlan[1]
    expect(step.change).toContain('Softbait / Gummifisch')
    expect(step.setup).toMatchObject({
      lureId: 'jig',
      size: 'small',
      inventoryFit: { preferredSize: 'medium', selectedSize: 'small', exact: false },
      presentation: { profileId: 'jighead', mode: 'controlled', sizeLabel: '3–5 cm' },
    })
    expect(step.setup?.presentation.weightLabel).toContain('1–4 g')
    expect(step.setup?.presentation.guidance).toContain('Grundkontakt')
    expect(decision.expertRanking).toEqual(createRecommendationDecision(conditions, []).expertRanking)
  })

  it('erklärt bei zwei vorhandenen Suchködern den fehlenden Gegenstil und bleibt beim Startköder', () => {
    const conditions = conditionsFor('perch', 'shallow', 'warm')
    const inventory: InventoryItem[] = [
      { targetFish: 'perch', lureTypeId: 'twitchbait', sizes: ['medium'] },
      { targetFish: 'perch', lureTypeId: 'spinner', sizes: ['medium'] },
    ]
    const recommendation = createRecommendationDecision(conditions, inventory).practicalRanking[0]
    const step = recommendation.switchPlan[1]
    expect(step.setup?.lureId).toBe(recommendation.setup.lure.id)
    expect(step.change).toContain('Bleibe beim vorhandenen')
    expect(step.reason).toContain('Kein passender anderer Präsentationsstil')
    expect(step.limit).not.toContain('Ein zweiter Präsentationsstil')
    expect(recommendation.switchPlan[2].limit).toBe('Nach zwei Versuchen ohne Kontakt')
  })

  it('erhält die bestehende Popper-Wechselstrategie für vorhandene Unterwasseroptionen', () => {
    const conditions: Conditions = {
      ...conditionsFor('perch', 'shallow', 'warm'),
      timeOfDay: 'dusk',
      activity: { status: 'observed', signs: ['surfaceActivity'] },
    }
    const inventory: InventoryItem[] = [
      { targetFish: 'perch', lureTypeId: 'popper', sizes: ['medium'] },
      { targetFish: 'perch', lureTypeId: 'twitchbait', sizes: ['medium'] },
      { targetFish: 'perch', lureTypeId: 'jig', sizes: ['medium'] },
    ]
    const recommendation = createRecommendationDecision(conditions, inventory).practicalRanking.find(
      item => item.setup.lure.id === 'popper',
    )!
    expect(recommendation.switchPlan[1].setup?.lureId).toBe('twitchbait')
  })
})
