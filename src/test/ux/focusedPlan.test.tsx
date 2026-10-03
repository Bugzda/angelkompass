import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Conditions, Recommendation } from '../../domain/models/types'
import { createRecommendationDecision } from '../../domain/engine/scoring'
import { lures } from '../../domain/catalogs/lures'
import { sessionStore } from '../../features/sessions/sessionStore'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { Layout } from '../../ui/components/Layout'

const conditions: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'autumn', timeOfDay: 'night', turbidity: 'clear', depth: 'medium', waterTemperature: 'unknown', light: 'unknown', activity: { status: 'unknown', signs: [] }, vegetation: 'unknown', observedStructure: ['dropoff'], structureStatus: 'observed' }
const inventory = lures.map(lure => ({ targetFish: 'perch' as const, lureTypeId: lure.id, sizes: [...lure.sizes] }))
const recommendation = () => createRecommendationDecision(conditions, inventory).practicalRanking[0]
function showSession(savedRecommendation: Recommendation = recommendation()) {
  const session = sessionStore.create(conditions, savedRecommendation)!
  render(<MemoryRouter initialEntries={[`/session/${session.id}/karte`]}><Routes><Route element={<Layout/>}><Route path="/session/:id/karte" element={<WaterCardPage/>}/></Route></Routes></MemoryRouter>)
  return session
}

beforeEach(() => {
  localStorage.clear(); sessionStore.resetForTests()
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('Aktueller Arbeitsauftrag und gespeicherter Startplan', () => {
  it('fokussiert nach einem Wechsel die neue Anweisung und erhält den ursprünglichen Snapshot', () => {
    const session = showSession()
    const snapshot = JSON.stringify(session.recommendation)
    const heading = screen.getByRole('heading', { name: session.recommendation.setup.lure.label })
    expect(heading).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Kontakt → nächster Schritt' }))
    const current = screen.getByRole('region', { name: 'Aktueller Handlungsschritt' })
    expect(current).toHaveFocus()
    expect(current).toHaveTextContent(session.recommendation.switchPlan[1].change)
    expect(screen.queryByRole('heading', { name: session.recommendation.setup.lure.label })).not.toBeInTheDocument()
    expect(screen.getByText('Ursprünglicher Startplan').closest('details')).not.toHaveAttribute('open')
    expect(JSON.stringify(sessionStore.getSnapshot()[0].recommendation)).toBe(snapshot)
    expect(sessionStore.getSnapshot()[0].rulesetVersion).toBe(session.rulesetVersion)
  })

  it('macht einen Wechsel rückgängig und zeigt wieder die dazugehörige Startmontage', () => {
    const session = showSession()
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Kontakt → nächster Schritt' }))
    fireEvent.click(screen.getByRole('button', { name: 'Letzte Rückmeldung rückgängig machen' }))
    expect(sessionStore.getSnapshot()[0].progress).toBe('initial')
    expect(sessionStore.getSnapshot()[0].feedback).toEqual([])
    expect(screen.getByRole('region', { name: 'Aktueller Handlungsschritt' })).toHaveFocus()
    expect(screen.getByRole('heading', { name: session.recommendation.setup.lure.label })).toBeVisible()
    expect(screen.getByText('Montage & Führung').closest('details')).toHaveAttribute('open')
  })

  it('wechselt bei Speicherfehlern nicht zu einer ungesicherten Anweisung', () => {
    const session = showSession()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError') })
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Kontakt → nächster Schritt' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht lokal gespeichert')
    expect(screen.getByRole('region', { name: 'Aktueller Handlungsschritt' })).toHaveTextContent(session.recommendation.switchPlan[0].change)
    expect(sessionStore.getSnapshot()[0].progress).toBe('initial')
    expect(sessionStore.getSnapshot()[0].feedback).toHaveLength(0)
  })

  it('lässt nach allen Schritten Biss und Fang zu und nimmt Rückmeldungen in der richtigen Reihenfolge zurück', () => {
    showSession()
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Kontakt → nächster Schritt' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Kontakt → nächster Schritt' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Kontakt → letzten Schritt beenden' }))
    expect(screen.getByRole('heading', { name: 'Weiterangeln oder abschließen' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Aktueller Handlungsschritt' })).toHaveFocus()
    expect(screen.queryByRole('button', { name: /Ohne Kontakt/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Biss' }))
    fireEvent.click(screen.getByRole('button', { name: 'Fang' }))
    expect(sessionStore.getSnapshot()[0].feedback.slice(-2).map(item=>item.outcome)).toEqual(['bite','catch'])
    fireEvent.click(screen.getByRole('button', { name: 'Letzte Rückmeldung rückgängig machen' }))
    expect(sessionStore.getSnapshot()[0].progress).toBe('exhausted')
    fireEvent.click(screen.getByRole('button', { name: 'Letzte Rückmeldung rückgängig machen' }))
    expect(sessionStore.getSnapshot()[0].progress).toBe('exhausted')
    fireEvent.click(screen.getByRole('button', { name: 'Letzte Rückmeldung rückgängig machen' }))
    expect(sessionStore.getSnapshot()[0].progress).toBe('move')
    expect(screen.getByRole('button', { name: 'Fang' })).toBeEnabled()
  })

  it('zeigt Montage, Größe, Gewicht und Führung aus dem aktuellen Wechselschritt', () => {
    const session=showSession()
    const setup=session.recommendation.switchPlan[1].setup!
    fireEvent.click(screen.getByRole('button',{name:'Ohne Kontakt → nächster Schritt'}))
    const panel=screen.getByText('Montage & Führung für diesen Schritt').closest('details')!
    expect(panel).toHaveAttribute('open')
    expect(within(panel).getByText(setup.lureLabel,{exact:true})).toBeVisible()
    expect(within(panel).getByText(setup.presentation.sizeLabel,{exact:true})).toBeVisible()
    expect(within(panel).getByText(setup.presentation.weightLabel,{exact:true})).toBeVisible()
    expect(within(panel).getByText(setup.presentation.mounting,{exact:true})).toBeVisible()
    expect(within(panel).getByText(setup.presentation.guidance,{exact:true})).toBeVisible()
  })

  it('erfindet bei alten Plänen keine fehlenden Wechselschritt-Montagen und erhält den Snapshot', () => {
    const legacy=recommendation()
    legacy.switchPlan.forEach(step=>{delete step.setup})
    legacy.switchPlan[1].change='Gespeicherte frühere Wechselanweisung'
    legacy.setup.resolvedPresentation!.mounting='Gespeicherte frühere Startmontage'
    const session=showSession(legacy)
    const snapshot=JSON.stringify(session.recommendation)
    fireEvent.click(screen.getByRole('button',{name:'Ohne Kontakt → nächster Schritt'}))
    expect(screen.getByRole('region',{name:'Aktueller Handlungsschritt'})).toHaveTextContent('Gespeicherte frühere Wechselanweisung')
    expect(screen.getByText(/Die Montage dieses Wechselschritts wurde/)).toBeVisible()
    expect(screen.queryByText('Montage & Führung für diesen Schritt')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Ursprünglicher Startplan'))
    expect(screen.getByText('Gespeicherte frühere Startmontage')).toBeVisible()
    expect(JSON.stringify(sessionStore.getSnapshot()[0].recommendation)).toBe(snapshot)
  })

  it('führt eine aktive Session unter Aktiver Plan und einen abgeschlossenen Eintrag unter Logbuch', () => {
    const session = showSession()
    const nav = within(screen.getByRole('navigation', { name: 'Hauptnavigation' }))
    expect(nav.getByRole('link', { name: 'Aktiver Plan' })).toHaveAttribute('aria-current', 'page')
    expect(nav.getByRole('link', { name: 'Aktiver Plan' })).toHaveAttribute('href', `/session/${session.id}/karte`)
    expect(nav.getByRole('link', { name: 'Logbuch' })).not.toHaveAttribute('aria-current')
    act(() => { sessionStore.complete(session.id) })
    expect(nav.getByRole('link', { name: 'Logbuch' })).toHaveAttribute('aria-current', 'page')
    expect(nav.getByRole('link', { name: 'Planen' })).toHaveAttribute('href', '/neu')
  })

  it('zeigt zunächst verständliche Angaben und Evidenz, Prozentwerte erst im Detail', () => {
    localStorage.setItem('angelkompass.inventory.v3', JSON.stringify({ schemaVersion: 3, items: inventory }))
    render(<MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}><RecommendationPage/></MemoryRouter>)
    const primary = screen.getAllByRole('article')[0]
    fireEvent.click(within(primary).getByRole('button', { name: 'Details anzeigen' }))
    expect(within(primary).getByText('4 Angaben noch offen')).toBeVisible()
    expect(within(primary).getByText(/Evidenz$/, { selector: 'dd' })).toBeVisible()
    const percentages = within(primary).getByText(/Eingabeabdeckung · \d+%:/)
    expect(percentages).not.toBeVisible()
    fireEvent.click(within(primary).getByText('Datenlage im Detail'))
    expect(percentages).toBeVisible()
    expect(within(primary).getByText(/keine Fangwahrscheinlichkeiten/)).toBeVisible()
  })
})
