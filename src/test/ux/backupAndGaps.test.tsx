import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { analysisScenarios, analyzeInventoryGaps } from '../../domain/engine/inventoryGaps'
import { createRecommendationDecision, createRecommendations } from '../../domain/engine/scoring'
import type { Conditions, FishingSession, InventoryItem, TargetFish } from '../../domain/models/types'
import { profileFor } from '../../domain/species/profiles'
import { DataPage } from '../../features/data/DataPage'
import { BACKUP_STATUS_KEY } from '../../features/data/storageKeys'
import {
  backupReminder,
  markBackupCreated,
  readBackupStatus,
  snoozeBackupReminder,
} from '../../features/data/backupStatus'
import { requestPersistenceOnce } from '../../features/data/storagePersistence'
import { INVENTORY_KEY } from '../../features/inventory/inventoryStorage'
import { InventoryGapPage } from '../../features/inventory/InventoryGapPage'
import { SessionsPage } from '../../features/sessions/SessionsPage'
import { sessionStore } from '../../features/sessions/sessionStore'
import { spotStore } from '../../features/spots/spotStore'
import { ToastViewport } from '../../ui/components/Toast'

let id = 0
beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
  spotStore.resetForTests()
  vi.stubGlobal('crypto', { randomUUID: () => `backup-test-${++id}` })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const perchBox: InventoryItem[] = [
  { targetFish: 'perch', lureTypeId: 'jig', sizes: ['medium'] },
  { targetFish: 'perch', lureTypeId: 'spinner', sizes: ['small'] },
]
const sample = (fish: TargetFish, step = 37) => analysisScenarios(fish).filter((_, index) => index % step === 0)

describe('Köderbox-Analyse', () => {
  it('rechnet ein festes, plausibles Situationsraster ohne Aktivitätsannahme', () => {
    const perch = analysisScenarios('perch')
    expect(perch).toHaveLength(2970)
    expect(analysisScenarios('pike')).toHaveLength(4455)
    expect(perch.every(item => item.activity.status === 'unknown')).toBe(true)
    expect(perch.some(item => item.season === 'winter' && item.waterTemperature === 'hot')).toBe(false)
    expect(perch.some(item => item.observedStructure.includes('hardCover'))).toBe(false)
    expect(analysisScenarios('pike').every(item => item.pikeSafetyConfirmed === true)).toBe(true)
  })

  it.each(['perch', 'pike', 'zander'] as const)(
    'stimmt für %s mit der praktischen Auswahl des Angelplans überein',
    fish => {
      const inventory =
        fish === 'perch' ? perchBox : [{ targetFish: fish, lureTypeId: 'jig' as const, sizes: ['medium' as const] }]
      const scenarios = sample(fish)
      const analysis = analyzeInventoryGaps(fish, inventory, scenarios)
      const decisions = scenarios.map(conditions => createRecommendationDecision(conditions, inventory))
      expect(analysis.covered).toBe(decisions.filter(item => item.practicalPrimary).length)
      expect(analysis.compromise).toBe(
        decisions.filter(item => item.practicalPrimary && !item.practicalPrimary.inventoryFit?.exact).length,
      )
      // Every simulated candidate matches the real decision with that lure size added.
      for (const candidate of analysis.candidates.slice(0, 3)) {
        const extended = inventory.some(item => item.lureTypeId === candidate.lureId)
          ? inventory.map(item =>
              item.lureTypeId === candidate.lureId ? { ...item, sizes: [...item.sizes, candidate.size] } : item,
            )
          : [...inventory, { targetFish: fish, lureTypeId: candidate.lureId, sizes: [candidate.size] }]
        const primary = scenarios.filter(conditions => {
          const first = createRecommendationDecision(conditions, extended).practicalPrimary
          return first?.setup.lure.id === candidate.lureId && first.setup.size === candidate.size
        }).length
        expect(candidate.primary).toBe(primary)
      }
    },
  )

  it('lässt das fachliche Ranking unverändert und schlägt nichts vor, wenn alles vorhanden ist', () => {
    const scenario = analysisScenarios('perch')[123] as Conditions
    const before = JSON.stringify(createRecommendations(scenario))
    analyzeInventoryGaps('perch', perchBox, [scenario])
    expect(JSON.stringify(createRecommendations(scenario))).toBe(before)

    const full = analyzeInventoryGaps(
      'zander',
      profileFor('zander').lures.map(lure => ({
        targetFish: 'zander' as const,
        lureTypeId: lure.id,
        sizes: lure.sizes,
      })),
      sample('zander'),
    )
    expect(full.covered).toBe(full.scenarioCount)
    expect(full.bestOwned).toBe(full.scenarioCount)
    expect(full.candidates).toEqual([])
  })

  it('ordnet bei leerer Box nach fachlich bester Wahl', () => {
    const analysis = analyzeInventoryGaps('zander', [], sample('zander'))
    expect(analysis.covered).toBe(0)
    const fits = analysis.candidates.map(item => item.bestFit)
    expect(fits).toEqual([...fits].sort((a, b) => b - a))
    expect(analysis.candidates[0]!.bestFit).toBeGreaterThan(0)
  })

  it('zeigt Ergebnisse ohne Worker und übernimmt einen Vorschlag in die Köderbox', async () => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: perchBox }))
    render(
      <MemoryRouter initialEntries={[{ pathname: '/bestand/analyse', state: { targetFish: 'perch' } }]}>
        <Routes>
          <Route
            path="/bestand/analyse"
            element={
              <>
                <InventoryGapPage />
                <ToastViewport />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Situationen werden durchgerechnet')
    const stats = await screen.findByLabelText('Abdeckung deiner Köderbox', undefined, { timeout: 5000 })
    expect(within(stats).getByText('Planbar').nextSibling).toHaveTextContent('100%')
    expect(screen.getByRole('heading', { name: 'Sinnvollste Ergänzungen' })).toBeInTheDocument()
    expect(screen.getByText(/keine\s+Fangwahrscheinlichkeit/)).toBeInTheDocument()
    const first = screen.getAllByRole('button', { name: /zur Köderbox hinzufügen/ })[0]!
    const label = first.getAttribute('aria-label')!
    fireEvent.click(first)
    expect(screen.getByText(/ist jetzt in deiner Köderbox/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(INVENTORY_KEY)!).items.length).toBeGreaterThanOrEqual(2)
    // The previous result stays visible while recalculating; the added size then leaves the list.
    expect(screen.getByLabelText('Abdeckung deiner Köderbox')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument(), {
      timeout: 5000,
    })
  })
})

const conditions: Conditions = {
  targetFish: 'perch',
  waterType: 'lake',
  season: 'summer',
  timeOfDay: 'day',
  turbidity: 'clear',
  depth: 'medium',
  waterTemperature: 'mild',
  light: 'diffuse',
  activity: { status: 'none', signs: [] },
  vegetation: 'none',
  observedStructure: [],
}
const readFile = (file: File) =>
  new Promise<string>(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsText(file)
  })
const session = (updatedAt: string) => ({ updatedAt }) as FishingSession

describe('Datensicherung absichern', () => {
  it('erinnert nach drei ungesicherten Einträgen oder nach einem Monat', () => {
    const now = new Date('2026-10-03T12:00:00Z')
    const three = [session('2026-10-01T10:00:00Z'), session('2026-10-02T10:00:00Z'), session('2026-10-03T10:00:00Z')]
    expect(backupReminder({}, [], [], now)).toBeUndefined()
    expect(backupReminder({}, three.slice(0, 2), [], now)).toBeUndefined()
    expect(backupReminder({}, three, [], now)).toEqual({ unsaved: 3, neverBackedUp: true })
    expect(backupReminder({ lastBackupAt: '2026-10-02T12:00:00Z' }, three, [], now)).toBeUndefined()
    expect(
      backupReminder({ lastBackupAt: '2026-08-01T00:00:00Z' }, [session('2026-08-05T00:00:00Z')], [], now),
    ).toEqual({ unsaved: 1, neverBackedUp: false })
    expect(backupReminder({ snoozedUntil: '2026-10-05T00:00:00Z' }, three, [], now)).toBeUndefined()
  })

  it('speichert Sicherungszeitpunkt und Pause robust', () => {
    localStorage.setItem(BACKUP_STATUS_KEY, '{kaputt')
    expect(readBackupStatus()).toEqual({})
    snoozeBackupReminder(new Date('2026-10-03T00:00:00Z'))
    expect(readBackupStatus().snoozedUntil).toBe('2026-10-10T00:00:00.000Z')
    markBackupCreated(new Date('2026-10-04T00:00:00Z'))
    expect(readBackupStatus()).toEqual({ lastBackupAt: '2026-10-04T00:00:00.000Z' })
  })

  it('zeigt die Erinnerung im Logbuch und pausiert sie auf Wunsch', () => {
    for (let index = 0; index < 3; index++) {
      const created = sessionStore.create(conditions, createRecommendations(conditions)[0]!)!
      sessionStore.complete(created.id)
    }
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    )
    const reminder = screen.getByRole('complementary', { name: 'Erinnerung an die Datensicherung' })
    expect(reminder).toHaveTextContent('Noch keine Sicherung vorhanden')
    expect(reminder).toHaveTextContent('3 Einträge sind nur in diesem Browser gespeichert')
    expect(within(reminder).getByRole('link', { name: 'Jetzt sichern' })).toHaveAttribute('href', '/daten')
    fireEvent.click(within(reminder).getByRole('button', { name: 'In 7 Tagen erinnern' }))
    expect(screen.queryByRole('complementary', { name: 'Erinnerung an die Datensicherung' })).not.toBeInTheDocument()
  })

  it('teilt die vollständige Sicherung als Datei und merkt sich den Zeitpunkt', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, share, canShare: () => true })
    render(
      <MemoryRouter>
        <DataPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Auf diesem Gerät wurde noch keine Sicherung erstellt.')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sicherung teilen oder in Dateien sichern' }))
    })
    const file = share.mock.calls[0]![0].files[0] as File
    expect(file.name).toMatch(/^angelkompass-sicherung-\d{4}-\d{2}-\d{2}\.json$/)
    expect(JSON.parse(await readFile(file))).toMatchObject({ app: 'Angelkompass', format: 'full-backup' })
    expect(screen.getByText(/Letzte Sicherung:/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vollständige Sicherung herunterladen' })).toHaveClass('secondary')
  })

  it('wertet ein geschlossenes Teilen-Menü nicht als Sicherung', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('abgebrochen', 'AbortError'))
    vi.stubGlobal('navigator', { ...navigator, share, canShare: () => true })
    render(
      <MemoryRouter>
        <DataPage />
      </MemoryRouter>,
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sicherung teilen oder in Dateien sichern' }))
    })
    expect(readBackupStatus().lastBackupAt).toBeUndefined()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('zeigt den Speicherschutz und fordert ihn an', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('navigator', { ...navigator, storage: { persisted: vi.fn().mockResolvedValue(false), persist } })
    render(
      <MemoryRouter>
        <DataPage />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Noch nicht geschützt.' })).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Speicherschutz anfordern' }))
    })
    expect(persist).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { name: 'Vor dem Aufräumen geschützt.' })).toBeInTheDocument()
  })

  it('fordert den Speicherschutz nach dem ersten Sessionstart nur einmal an', async () => {
    const persist = vi.fn().mockResolvedValue(false)
    vi.stubGlobal('navigator', { ...navigator, storage: { persisted: vi.fn().mockResolvedValue(false), persist } })
    requestPersistenceOnce()
    await vi.waitFor(() => expect(persist).toHaveBeenCalledOnce())
    requestPersistenceOnce()
    await Promise.resolve()
    expect(persist).toHaveBeenCalledOnce()
  })
})
