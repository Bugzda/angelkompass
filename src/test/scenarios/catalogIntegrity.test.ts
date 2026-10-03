import { describe, expect, it } from 'vitest'
import { speciesProfiles } from '../../domain/species/profiles'
import type { Conditions, NumericRange } from '../../domain/models/types'
import { evaluateSetups, evaluateSpots } from '../../domain/engine/scoring'
import { productSources } from '../../domain/research/productSources'

const conditions: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'summer', timeOfDay: 'day', turbidity: 'clear', depth: 'medium', waterTemperature: 'mild', light: 'diffuse', activity: { status: 'none', signs: [] }, vegetation: 'none', observedStructure: [] }
function validRange(range: NumericRange | undefined) {
  expect(range).toBeDefined()
  expect(Number.isFinite(range!.min)).toBe(true)
  expect(range!.min).toBeGreaterThanOrEqual(0)
  if (range!.max !== undefined) expect(range!.max).toBeGreaterThanOrEqual(range!.min)
}

describe.each(Object.values(speciesProfiles))('$label: Katalog und Präsentationen', profile => {
  it('enthält eindeutige IDs, Größenbereiche, Gewichte und aufgelöste Regelquellen', () => {
    expect(new Set(profile.lures.map(item => item.id)).size).toBe(profile.lures.length)
    expect(new Set(profile.spots.map(item => item.id)).size).toBe(profile.spots.length)
    expect(new Set(profile.allRules.map(item => item.id)).size).toBe(profile.allRules.length)
    for (const lure of profile.lures) {
      expect(lure.presentations?.length).toBeGreaterThan(0)
      for (const size of lure.sizes) validRange(lure.sizeRangesCm?.[size])
      for (const depth of lure.depths) expect(lure.presentations?.some(item => item.depths.includes(depth))).toBe(true)
      for (const presentation of lure.presentations ?? []) {
        for (const depth of presentation.depths) {
          expect(lure.depths).toContain(depth)
          if (presentation.weightKind === 'terminal') validRange(presentation.terminalWeightByDepth?.[depth])
        }
        if (presentation.weightKind === 'lure-total') for (const size of lure.sizes) validRange(presentation.lureWeightBySize?.[size])
      }
    }
    for (const rule of profile.allRules) for (const id of rule.sourceIds) expect(productSources[id], `${rule.id}: ${id}`).toBeDefined()
  })
  it('wählt in jeder Kombination aus Tiefe und Kraut nur tiefenkompatible Montagen', () => {
    for (const depth of ['shallow', 'medium', 'deep'] as const) {
      for (const vegetation of ['none', 'edgeOrGaps', 'dense', 'unknown'] as const) {
        const input = { ...conditions, targetFish: profile.targetFish, pikeSafetyConfirmed: true, depth, vegetation }
        for (const spot of evaluateSpots(input)) for (const setup of evaluateSetups(input, spot)) {
          const presentation = setup.lure.presentations!.find(item => item.id === setup.resolvedPresentation!.profileId)
          expect(presentation?.depths, `${profile.label}/${setup.lure.id}/${vegetation}/${depth}`).toContain(depth)
          expect(setup.resolvedPresentation!.weightLabel).not.toMatch(/undefined|NaN/)
        }
      }
    }
  })
  it('gibt bei unbekannter Tiefe keine tiefenabhängige Grammzahl oder Gewichtsklasse vor', () => {
    const input = { ...conditions, targetFish: profile.targetFish, pikeSafetyConfirmed: true, depth: 'unknown' as const }
    for (const spot of evaluateSpots(input)) for (const setup of evaluateSetups(input, spot)) {
      const presentation = setup.resolvedPresentation!
      if (presentation.weightKind === 'terminal') {
        expect(setup.weight, setup.lure.id).toBe('unknown')
        expect(presentation.weightLabel).toContain('Tiefe unbekannt')
        expect(presentation.weightLabel).not.toMatch(/\d.*\bg\b/)
      } else if (presentation.weightKind === 'lure-total') {
        expect(setup.weight).not.toBe('unknown')
        expect(presentation.weightLabel).toContain('Ködergesamtgewicht')
      }
    }
  })
})
