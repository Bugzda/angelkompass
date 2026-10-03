import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { parseBackup, planRestore, restoreBackup, serializeBackup } from '../../features/data/dataBackup'
import { SPOT_KEY } from '../../features/data/storageKeys'
import { recoverPendingRestore, storageSnapshot } from '../../features/data/storageTransaction'
import { INVENTORY_KEY } from '../../features/inventory/inventoryStorage'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { logbookInsights } from '../../features/sessions/insights'
import { sessionStore } from '../../features/sessions/sessionStore'
import { SituationPage } from '../../features/situation/SituationPage'
import { compassLabel, parseWeather, pressureTrend } from '../../features/situation/weather'
import { applySpotDefaults, spotDefaultsFrom, spotStore } from '../../features/spots/spotStore'

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
let id = 0
beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
  spotStore.resetForTests()
  vi.stubGlobal('crypto', { randomUUID: () => `spot-test-${++id}` })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function Probe() {
  const location = useLocation()
  return <output data-testid="state">{JSON.stringify(location.state)}</output>
}

describe('Angelstellen', () => {
  it('übernimmt nur stabile Gewässermerkmale und lässt Zeit, Licht und Aktivität unberührt', () => {
    const spot = spotStore.create('Schilfbucht', {
      turbidity: 'turbid',
      depth: 'deep',
      observedStructure: ['hardCover'],
    })!
    const applied = applySpotDefaults({ ...conditions, light: 'bright' }, spot.defaults)
    expect(applied).toMatchObject({ turbidity: 'turbid', depth: 'deep', light: 'bright', season: 'summer' })
    // Hard cover is not part of the perch form and is ignored there.
    expect(applied.observedStructure).toEqual([])
    expect(applySpotDefaults({ ...conditions, targetFish: 'pike' }, spot.defaults).observedStructure).toEqual([
      'hardCover',
    ])
  })

  it('merkt sich eine Stelle im Formular und reicht sie bis zur gespeicherten Session durch', () => {
    localStorage.setItem(
      INVENTORY_KEY,
      JSON.stringify({
        schemaVersion: 3,
        items: [{ targetFish: 'perch', lureTypeId: 'jig', sizes: ['small', 'medium', 'large'] }],
      }),
    )
    render(
      <MemoryRouter initialEntries={['/neu/perch']}>
        <Routes>
          <Route path="/neu/:fish" element={<SituationPage />} />
          <Route path="/empfehlung" element={<RecommendationPage />} />
          <Route path="/session/:id/karte" element={<Probe />} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Trüb' }))
    fireEvent.click(screen.getByRole('button', { name: /als Angelstelle merken/ }))
    fireEvent.change(screen.getByLabelText('Name der Angelstelle'), { target: { value: 'Steg Süd' } })
    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
    expect(screen.getByRole('button', { name: 'Steg Süd' })).toHaveAttribute('aria-pressed', 'true')
    expect(spotStore.getSnapshot()[0].defaults.turbidity).toBe('turbid')
    fireEvent.click(screen.getByRole('button', { name: /Empfehlungen berechnen/ }))
    expect(screen.getByText(/Steg Süd/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mit diesem Plan ans Wasser' }))
    const session = sessionStore.getSnapshot()[0]
    expect(session.spot).toEqual({ id: spotStore.getSnapshot()[0].id, name: 'Steg Süd' })
    // The engine input and stored conditions never contain the spot reference.
    expect(session.conditions).not.toHaveProperty('spotRef')
  })

  it('bietet nach Änderungen das Aktualisieren der gewählten Stelle an', () => {
    const spot = spotStore.create('Bucht', spotDefaultsFrom(conditions))!
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/neu/perch', state: { ...conditions, spotRef: { id: spot.id, name: spot.name } } },
        ]}
      >
        <Routes>
          <Route path="/neu/:fish" element={<SituationPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: /mit diesen Angaben aktualisieren/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tief' }))
    fireEvent.click(screen.getByRole('button', { name: /mit diesen Angaben aktualisieren/ }))
    expect(spotStore.getSnapshot()[0].defaults.depth).toBe('deep')
  })

  it('sichert Angelstellen mit und stellt sie verlustfrei wieder her', () => {
    spotStore.create('Nordufer', spotDefaultsFrom(conditions))
    const backup = parseBackup(serializeBackup())
    expect(backup.spots).toHaveLength(1)
    localStorage.clear()
    spotStore.resetForTests()
    const plan = planRestore(backup)
    expect(plan.addedSpots).toBe(1)
    restoreBackup(plan)
    expect(spotStore.getSnapshot()[0].name).toBe('Nordufer')
  })

  it('liest ältere Sicherungen ohne Angelstellen und lässt den Speicherbereich dann unberührt', () => {
    const legacy = JSON.parse(serializeBackup())
    delete legacy.spots
    const plan = planRestore(parseBackup(JSON.stringify(legacy)))
    expect(plan.addedSpots).toBe(0)
    expect(plan.after[SPOT_KEY]).toBeNull()
  })

  it('holt auch eine ältere offene Rücksicherung ohne Angelstellen nach', () => {
    spotStore.create('Bleibt', spotDefaultsFrom(conditions))
    const { [SPOT_KEY]: _spots, ...legacyBefore } = storageSnapshot()
    localStorage.setItem('angelkompass.restore.pending.v1', JSON.stringify({ schemaVersion: 1, before: legacyBefore }))
    recoverPendingRestore()
    expect(localStorage.getItem('angelkompass.restore.pending.v1')).toBeNull()
    expect(JSON.parse(localStorage.getItem(SPOT_KEY)!).spots[0].name).toBe('Bleibt')
  })
})

describe('Persönliche Auswertung', () => {
  it('ordnet Kontakte dem tatsächlich verwendeten Köder zu und findet den längsten Fang', () => {
    const recommendation = createRecommendations(conditions)[0]
    const session = sessionStore.create(conditions, recommendation, { id: 's1', name: 'Bucht' })!
    sessionStore.addFeedback(session.id, 'bite')
    sessionStore.addFeedback(session.id, 'no_success')
    sessionStore.addFeedback(session.id, 'catch')
    const stored = sessionStore.getSnapshot()[0]
    sessionStore.updateFeedbackDetails(session.id, stored.feedback[2].id, { lengthCm: 27 })
    const data = logbookInsights(sessionStore.getSnapshot())
    expect(data.contacts).toBe(2)
    expect(data.longestCatch?.lengthCm).toBe(27)
    const lures = data.groups.find(group => group.id === 'lure')!
    const refineLure = recommendation.switchPlan[1].setup?.lureLabel ?? recommendation.setup.lure.label
    expect(lures.rows.find(row => row.label === refineLure)?.catches).toBe(1)
    expect(data.groups.find(group => group.id === 'spot')?.rows[0]).toMatchObject({ label: 'Bucht', sessions: 1 })
  })
})

describe('Wetter-Zusatzinformationen', () => {
  it('berechnet die Luftdrucktendenz der letzten drei Stunden und die Windrichtung', () => {
    const now = 1_800_000_000
    const hourly = { time: [now - 3 * 3600, now - 3600], pressure_msl: [1010, 1012] }
    expect(pressureTrend(hourly, now, 1012.4)).toBe('rising')
    expect(pressureTrend(hourly, now, 1008)).toBe('falling')
    expect(pressureTrend(hourly, now, 1010.5)).toBe('steady')
    expect(pressureTrend({}, now, 1010)).toBeNull()
    expect(compassLabel(27)).toBe('NO')
    expect(compassLabel(350)).toBe('N')
    const current = Math.floor(Date.now() / 1000)
    expect(
      parseWeather({ current: { time: current, pressure_msl: 1015, wind_direction_10m: 200 }, daily: {} }),
    ).toMatchObject({ pressure: 1015, windDirection: 200, pressureTrend: null })
  })
})
