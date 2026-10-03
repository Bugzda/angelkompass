import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import type { Conditions } from '../../domain/models/types'
import { createRecommendations, evaluateSetups, evaluateSpots } from '../../domain/engine/scoring'
import { useInventory } from '../../features/inventory/useInventory'
import { InventoryPage } from '../../features/inventory/InventoryPage'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { SituationPage } from '../../features/situation/SituationPage'
import { SessionsPage } from '../../features/sessions/SessionsPage'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { sessionStore } from '../../features/sessions/sessionStore'
import { serializeSessions, downloadSessions } from '../../features/sessions/sessionExport'
import { useTheme } from '../../ui/hooks/useTheme'

const conditions: Conditions = {
  targetFish: 'perch',
  waterType: 'lake',
  season: 'autumn',
  timeOfDay: 'dusk',
  turbidity: 'clear',
  depth: 'medium',
  waterTemperature: 'mild',
  light: 'diffuse',
  activity: { status: 'observed', signs: ['baitfish'] },
  vegetation: 'edgeOrGaps',
  observedStructure: ['dropoff'],
}
const inventoryKey = 'angelkompass.inventory.v3'
const sessionsKey = 'angelkompass.sessions.v1'

beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  )
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Bestand und gesperrter Speicher', () => {
  it('entfernt beim Abwählen der letzten Größe das ganze Profil', () => {
    const { result } = renderHook(() => useInventory())
    act(() => result.current.toggleSize('perch', 'jig', 'medium'))
    act(() => result.current.toggleSize('perch', 'jig', 'medium'))
    expect(result.current.inventory).toEqual([])
    expect(JSON.parse(localStorage.getItem(inventoryKey)!).items).toEqual([])
  })

  it('synchronisiert mehrere Ansichten und behält deren Änderungen', () => {
    const first = renderHook(() => useInventory())
    const second = renderHook(() => useInventory())
    act(() => first.result.current.toggleSize('perch', 'jig', 'medium'))
    act(() => second.result.current.toggleSize('pike', 'jig', 'large'))
    expect(first.result.current.inventory).toHaveLength(2)
    expect(second.result.current.inventory).toEqual(first.result.current.inventory)
  })

  it('liest die aktuelle Auswahl eines anderen Tabs vor einer Änderung', () => {
    const { result } = renderHook(() => useInventory())
    localStorage.setItem(
      inventoryKey,
      JSON.stringify({ schemaVersion: 3, items: [{ targetFish: 'pike', lureTypeId: 'jig', sizes: ['large'] }] }),
    )
    act(() => result.current.toggleSize('perch', 'jig', 'medium'))
    expect(result.current.inventory).toHaveLength(2)
    localStorage.setItem(inventoryKey, JSON.stringify({ schemaVersion: 3, items: [] }))
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: inventoryKey })))
    expect(result.current.inventory).toEqual([])
  })

  it('übernimmt bei vollem Speicher keine scheinbar gespeicherte Auswahl', () => {
    const { result } = renderHook(() => useInventory())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError')
    })
    act(() => result.current.toggleSize('perch', 'jig', 'medium'))
    expect(result.current.inventory).toEqual([])
    expect(result.current.error).toMatch(/nicht übernommen/)
  })

  it('überschreibt beschädigte Bestandsdaten weder beim Öffnen noch beim Auswählen', () => {
    localStorage.setItem(inventoryKey, '{beschädigt')
    const { result } = renderHook(() => useInventory())
    act(() => result.current.toggleAllSizes('perch', 'jig'))
    expect(localStorage.getItem(inventoryKey)).toBe('{beschädigt')
    expect(result.current.error).toBeTruthy()
  })

  it('kann ohne lesbaren oder schreibbaren Speicher das Farbschema wechseln', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    const { result } = renderHook(() => useTheme())
    expect(result.current.preference).toBe('system')
    act(() => result.current.setPreference('dark'))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

function BackButton() {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>Browser zurück</button>
}
function Flow({ state = conditions }: { state?: unknown }) {
  return (
    <MemoryRouter initialEntries={[{ pathname: '/empfehlung', state }]}>
      <BackButton />
      <Routes>
        <Route path="/empfehlung" element={<RecommendationPage />} />
        <Route path="/neu/:fish" element={<SituationPage />} />
        <Route path="/bestand" element={<InventoryPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Eingabeerhalt und Navigation', () => {
  it.each([
    {},
    { targetFish: 'zander' },
    { ...conditions, activity: null },
    { ...conditions, targetFish: 'pike', pikeSafetyConfirmed: false },
  ])('fängt ungültigen Router-State ab: %j', state => {
    render(<Flow state={state} />)
    expect(screen.getByRole('heading', { name: 'Keine Berechnung vorhanden' })).toBeInTheDocument()
  })

  it('behält Bedingungen beim Bearbeiten und bei Browser-Zurück', () => {
    render(<Flow />)
    fireEvent.click(screen.getByRole('link', { name: 'Bedingungen ändern' }))
    fireEvent.click(screen.getByRole('button', { name: /Zeit ändern:/ }))
    expect(screen.getByRole('button', { name: 'Herbst' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Klar' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Tief' }))
    fireEvent.click(screen.getByRole('button', { name: /Empfehlungen berechnen/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Browser zurück' }))
    expect(screen.getByRole('button', { name: 'Tief' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('führt nach einer Bestandsänderung mit denselben Eingaben zum Ergebnis', () => {
    render(<Flow />)
    fireEvent.click(screen.getByRole('link', { name: 'Köderbox bearbeiten' }))
    fireEvent.click(screen.getByRole('button', { name: 'Barsch Softbait / Gummifisch: Alle Größen' }))
    fireEvent.click(screen.getByRole('link', { name: /Zurück zum Angelplan/ }))
    expect(screen.getByRole('button', { name: 'Mit diesem Plan ans Wasser' })).toBeEnabled()
    fireEvent.click(screen.getByRole('link', { name: 'Bedingungen ändern' }))
    expect(screen.getByRole('button', { name: 'Klar' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('erfindet bei einer neuen Session keine Wasserbeobachtungen', () => {
    render(
      <MemoryRouter initialEntries={['/neu/perch']}>
        <Routes>
          <Route path="/neu/:fish" element={<SituationPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(
      within(screen.getByRole('group', { name: 'Wassertrübung' })).getByRole('button', { name: 'Unbekannt' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      within(screen.getByRole('group', { name: 'Angeltiefe' })).getByRole('button', { name: 'Unbekannt' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Session und Logbuch', () => {
  it('verwirft ungültige Datumsangaben vor der Darstellung', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    localStorage.setItem(
      sessionsKey,
      JSON.stringify({ schemaVersion: 1, sessions: [{ ...session, createdAt: 'kein Datum' }] }),
    )
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()).toEqual([])
  })

  it('überschreibt einen beschädigten Sessionspeicher nicht', () => {
    localStorage.setItem(sessionsKey, '{beschädigt')
    expect(sessionStore.create(conditions, createRecommendations(conditions)[0])).toBeUndefined()
    expect(localStorage.getItem(sessionsKey)).toBe('{beschädigt')
  })

  it('verhindert einen zweiten Start, wenn ein anderer Tab bereits gestartet hat', () => {
    const first = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.complete(first.id)
    localStorage.setItem(sessionsKey, JSON.stringify({ schemaVersion: 1, sessions: [first] }))
    expect(sessionStore.create(conditions, createRecommendations(conditions)[0])).toBeUndefined()
  })

  it('meldet Änderungen aus einem anderen Tab an offene Sessionansichten', () => {
    const first = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    const listener = vi.fn()
    const unsubscribe = sessionStore.subscribe(listener)
    localStorage.setItem(
      sessionsKey,
      JSON.stringify({ schemaVersion: 1, sessions: [{ ...first, status: 'completed' }] }),
    )
    window.dispatchEvent(new StorageEvent('storage', { key: sessionsKey }))
    expect(sessionStore.getSnapshot()[0].status).toBe('completed')
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it('setzt beim Rückgängigmachen den ausgeschöpften Plan auf die vorherige Phase', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    for (let i = 0; i < 3; i++) sessionStore.addFeedback(session.id, 'no_success')
    expect(sessionStore.undoFeedback(session.id)).toBe(true)
    expect(sessionStore.getSnapshot()[0].progress).toBe('move')
    expect(sessionStore.getSnapshot()[0].feedback).toHaveLength(2)
    sessionStore.complete(session.id)
    expect(sessionStore.undoFeedback(session.id)).toBe(false)
  })

  it('zeigt Schreibfehler auf der Am-Wasser-Karte und bestätigt keinen Fang', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    render(
      <MemoryRouter initialEntries={[`/session/${session.id}/karte`]}>
        <Routes>
          <Route path="/session/:id/karte" element={<WaterCardPage />} />
        </Routes>
      </MemoryRouter>,
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Fang' }))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht lokal gespeichert')
    expect(sessionStore.getSnapshot()[0].feedback).toHaveLength(0)
  })

  it('filtert Sessions und die Statistik gemeinsam nach Fischart', () => {
    const perch = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.addFeedback(perch.id, 'catch')
    sessionStore.complete(perch.id)
    const pikeConditions: Conditions = { ...conditions, targetFish: 'pike', pikeSafetyConfirmed: true }
    const pike = sessionStore.create(pikeConditions, createRecommendations(pikeConditions)[0])!
    sessionStore.addFeedback(pike.id, 'bite')
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Hecht' }))
    expect(screen.queryByRole('link', { name: /Barsch ·/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Hecht ·/ })).toBeInTheDocument()
    const stats = screen.getByLabelText('Statistik der angezeigten Sessions')
    expect(within(stats).getByText('Fänge').parentElement).toHaveTextContent('00')
    expect(within(stats).getByText('Bisse').parentElement).toHaveTextContent('01')
  })

  it('exportiert vollständige Snapshots und Rückmeldungen unverändert', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.addFeedback(session.id, 'catch')
    const exported = JSON.parse(serializeSessions(sessionStore.getSnapshot()))
    expect(exported.sessions).toEqual(sessionStore.getSnapshot())
    expect(exported.schemaVersion).toBe(1)
    expect(exported.sessions[0].feedback[0].outcome).toBe('catch')
  })

  it('erstellt einen JSON-Download und gibt die Objekt-URL wieder frei', () => {
    vi.useFakeTimers()
    const create = vi.fn().mockReturnValue('blob:session-export')
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toMatch(/^angelkompass-sessions-.*\.json$/)
      expect(this.href).toBe('blob:session-export')
    })
    downloadSessions([])
    expect(click).toHaveBeenCalledOnce()
    expect(create.mock.calls[0][0].type).toBe('application/json')
    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledWith('blob:session-export')
  })
})

describe('Temperatur vor Kalenderfallback', () => {
  it.each(['cold', 'cool', 'mild', 'warm', 'hot', 'unknown'] as const)(
    'nutzt beim Hecht die Sommerannahme nur ohne Temperaturmessung: %s',
    waterTemperature => {
      const observed: Conditions = {
        ...conditions,
        targetFish: 'pike',
        season: 'summer',
        depth: 'shallow',
        waterTemperature,
        pikeSafetyConfirmed: true,
      }
      const popper = evaluateSetups(observed, evaluateSpots(observed)[0]).find(item => item.lure.id === 'popper')!
      expect(popper.reasons.some(reason => reason.ruleId === 'PKL019')).toBe(
        !['warm', 'unknown'].includes(waterTemperature),
      )
    },
  )

  it('nutzt bei gemessenem mildem Winterwasser die passende Größe und aktive Führung', () => {
    const winter: Conditions = { ...conditions, season: 'winter' }
    const jig = evaluateSetups(winter, evaluateSpots(winter)[0]).find(item => item.lure.id === 'jig')!
    expect(jig.size).toBe('medium')
    expect(jig.resolvedPresentation?.mode).toBe('active')
    const unknown: Conditions = { ...winter, waterTemperature: 'unknown' }
    const fallback = evaluateSetups(unknown, evaluateSpots(unknown)[0]).find(item => item.lure.id === 'jig')!
    expect(fallback.size).toBe('small')
    expect(fallback.resolvedPresentation?.mode).toBe('slow')
  })
})
