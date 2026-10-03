import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Conditions } from '../../domain/models/types'
import { createRecommendationDecision, createRecommendations, evaluateSpots } from '../../domain/engine/scoring'
import { canRecommend } from '../../domain/models/validation'
import { profileFor } from '../../domain/species/profiles'
import { productSources } from '../../domain/research/productSources'
import { explain } from '../../domain/engine/explanations'
import { SituationPage } from '../../features/situation/SituationPage'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { SessionPage } from '../../features/sessions/SessionPage'
import { SessionsPage } from '../../features/sessions/SessionsPage'
import { InventoryPage } from '../../features/inventory/InventoryPage'
import { sessionStore } from '../../features/sessions/sessionStore'
import { readInventory, useInventory } from '../../features/inventory/useInventory'
import { serializeSessions } from '../../features/sessions/sessionExport'

const conditions: Conditions = {
  targetFish: 'zander',
  waterType: 'lake',
  season: 'autumn',
  timeOfDay: 'unknown',
  light: 'unknown',
  turbidity: 'unknown',
  depth: 'unknown',
  waterTemperature: 'unknown',
  activity: { status: 'unknown', signs: [] },
  vegetation: 'unknown',
  observedStructure: [],
  structureStatus: 'unknown',
}
beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
})
afterEach(cleanup)

describe('Zander-Regelwerk', () => {
  it('bleibt bei unbekannten Beobachtungen neutral und verwendet ein eigenes Regelwerk', () => {
    expect(canRecommend(conditions)).toBe(true)
    expect(evaluateSpots(conditions).every(item => item.score === 50 && item.reasons.length === 0)).toBe(true)
    expect(profileFor('zander').rulesetVersion).toBe('zander-lake-1.0.0')
  })
  it('bevorzugt nachts im Flachen den Wobbler und respektiert explizit helles Licht', () => {
    const night = { ...conditions, timeOfDay: 'night' as const, depth: 'shallow' as const, vegetation: 'none' as const }
    expect(createRecommendations(night)[0].setup.lure.id).toBe('twitchbait')
    const bright = createRecommendations({ ...night, light: 'bright' })
    expect(bright.flatMap(item => item.setup.reasons).some(item => item.ruleId === 'ZLK013')).toBe(false)
  })
  it('liefert tiefenkompatible Montagen und wechselt im Kraut auf Offset', () => {
    const deep = createRecommendations({ ...conditions, depth: 'deep', observedStructure: ['dropoff'] })
    expect(deep).toHaveLength(3)
    expect(deep.every(item => item.setup.lure.depths.includes('deep'))).toBe(true)
    expect(deep.every(item => !item.switchPlan[1].change.includes('Wobbler'))).toBe(true)
    const dense = createRecommendations({ ...conditions, depth: 'shallow', vegetation: 'dense' })
    expect(dense[0].setup.lure.id).toBe('jig')
    expect(dense[0].setup.resolvedPresentation?.profileId).toBe('zander-texas')
  })
  it('verlangt Zanderbestand und nutzt bei fehlender Struktur einen neutralen Bereich', () => {
    expect(
      createRecommendationDecision(conditions, [{ targetFish: 'perch', lureTypeId: 'jig', sizes: ['medium'] }])
        .practicalRanking,
    ).toHaveLength(0)
    const result = createRecommendationDecision({ ...conditions, structureStatus: 'none' }, [
      { targetFish: 'zander', lureTypeId: 'jig', sizes: ['large'] },
    ])
    expect(result.practicalPrimary?.spot.spot.id).toBe('openWater')
    expect(result.practicalPrimary?.inventoryFit).toEqual({
      preferredSize: 'medium',
      selectedSize: 'large',
      exact: false,
    })
    expect(result.optionalSpotTip).toBeUndefined()
  })
  it('hat auflösbare Quellen und verständliche Begründungen für jede Regel', () => {
    const rules = profileFor('zander').allRules
    expect(new Set(rules.map(rule => rule.id)).size).toBe(rules.length)
    for (const rule of rules) {
      for (const source of rule.sourceIds) expect(productSources[source], rule.id).toBeDefined()
      const text = explain({
        ruleId: rule.id,
        reasonCode: rule.reasonCode,
        group: rule.group,
        evidenceClass: rule.evidenceClass,
        evidenceConfidence: rule.confidence,
        rawDelta: 1,
        appliedDelta: 1,
      })
      expect(text).not.toContain(rule.reasonCode)
      if (rule.evidenceClass !== 'observation') expect(rule.sourceIds.length).toBeGreaterThan(0)
    }
  })
})

describe('Zander-Nutzerablauf und Speicherung', () => {
  it('speichert Zandergrößen getrennt und erhält Barsch- und Hechtbestand', () => {
    const { result, unmount } = renderHook(() => useInventory())
    act(() => result.current.toggleSize('perch', 'jig', 'small'))
    act(() => result.current.toggleSize('pike', 'jig', 'large'))
    act(() => result.current.toggleSize('zander', 'jig', 'medium'))
    unmount()
    expect(readInventory()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetFish: 'perch', sizes: ['small'] }),
        expect.objectContaining({ targetFish: 'pike', sizes: ['large'] }),
        expect.objectContaining({ targetFish: 'zander', sizes: ['medium'] }),
      ]),
    )
    render(
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Zander' }))
    expect(screen.getByRole('button', { name: 'Zander Zander-Gummifisch: Mittel · 10–13 cm' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('heading', { name: 'Barsch' })).not.toBeInTheDocument()
  })
  it('startet über die Zander-URL, speichert den Plan und lädt ihn im Logbuch und Export', () => {
    localStorage.setItem(
      'angelkompass.inventory.v3',
      JSON.stringify({ schemaVersion: 3, items: [{ targetFish: 'zander', lureTypeId: 'jig', sizes: ['medium'] }] }),
    )
    const view = render(
      <MemoryRouter initialEntries={['/neu/zander']}>
        <Routes>
          <Route path="/neu/:fish" element={<SituationPage />} />
          <Route path="/empfehlung" element={<RecommendationPage />} />
          <Route path="/session/:id" element={<SessionPage />} />
          <Route path="/session/:id/karte" element={<WaterCardPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Zander · See · vom Ufer')).toBeInTheDocument()
    expect(screen.queryByText('Jagende Barsche')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Zanderkontakt' }))
    fireEvent.click(screen.getByRole('button', { name: /Empfehlungen berechnen/ }))
    expect(screen.getByRole('heading', { name: 'Dein Angelplan' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mit diesem Plan ans Wasser/ }))
    expect(screen.getByText(/Zander · Schritt 1 von 3/)).toBeInTheDocument()
    const saved = sessionStore.getSnapshot()[0]
    expect(saved.conditions.activity.signs).toEqual(['zanderContact'])
    expect(saved.rulesetVersion).toBe('zander-lake-1.0.0')
    act(() => {
      sessionStore.addFeedback(saved.id, 'catch')
      sessionStore.complete(saved.id)
    })
    view.unmount()
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()[0].feedback[0].outcome).toBe('catch')
    expect(JSON.parse(serializeSessions(sessionStore.getSnapshot())).sessions[0].conditions.targetFish).toBe('zander')
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Zander' }))
    expect(screen.getByRole('link', { name: /Zander · Zander-Gummifisch/ })).toBeInTheDocument()
  })
})
