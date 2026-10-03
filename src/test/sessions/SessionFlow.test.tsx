import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { SessionsPage } from '../../features/sessions/SessionsPage'
import { sessionStore } from '../../features/sessions/sessionStore'

const conditions: Conditions = {
  targetFish: 'perch',
  waterType: 'lake',
  season: 'autumn',
  timeOfDay: 'dusk',
  turbidity: 'slightly_turbid',
  depth: 'medium',
  waterTemperature: 'mild',
  light: 'diffuse',
  activity: { status: 'observed', signs: ['baitfish'] },
  vegetation: 'edgeOrGaps',
  observedStructure: [],
}

beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
  let id = 0
  vi.stubGlobal('crypto', { randomUUID: () => `flow-${++id}` })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Session-Nutzerablauf', () => {
  it('startet eine bewusst gewählte Top-3-Empfehlung und öffnet ihre Session', () => {
    const top = createRecommendations(conditions)
    localStorage.setItem(
      'angelkompass.inventory.v1',
      JSON.stringify(top.map(item => ({ lureTypeId: item.setup.lure.id }))),
    )
    render(
      <MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}>
        <Routes>
          <Route path="/empfehlung" element={<RecommendationPage />} />
          <Route path="/session/:id/karte" element={<WaterCardPage />} />
        </Routes>
      </MemoryRouter>,
    )
    const alternative = screen.getAllByRole('button', { name: 'Alternative starten' })[0]
    fireEvent.click(alternative)
    expect(screen.getByRole('group', { name: 'Rückmeldung erfassen' })).toBeInTheDocument()
    expect(sessionStore.getSnapshot()[0].recommendation.rank).toBe(2)
  })

  it('blockiert bei einer aktiven Session alle weiteren Starts', () => {
    const top = createRecommendations(conditions)
    localStorage.setItem(
      'angelkompass.inventory.v1',
      JSON.stringify(top.map(item => ({ lureTypeId: item.setup.lure.id }))),
    )
    sessionStore.create(conditions, createRecommendations(conditions)[0])
    render(
      <MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}>
        <Routes>
          <Route path="/empfehlung" element={<RecommendationPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Eine Session ist bereits aktiv.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mit diesem Plan ans Wasser' })).toBeDisabled()
    expect(
      screen.getAllByRole('button', { name: 'Alternative starten' }).every(button => button.hasAttribute('disabled')),
    ).toBe(true)
  })

  it('trennt vorhandene Optionen von einem fehlenden Köder-Tipp', () => {
    const top = createRecommendations(conditions)
    localStorage.setItem('angelkompass.inventory.v1', JSON.stringify([{ lureTypeId: top[0].setup.lure.id }]))
    render(
      <MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}>
        <Routes>
          <Route path="/empfehlung" element={<RecommendationPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getAllByText('In deiner Köderbox')).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Mit diesem Plan ans Wasser' })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Nicht im Bestand' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fachlich beste Ergänzung' })).toBeInTheDocument()
    expect(screen.getAllByText('Nicht in deiner Köderbox')).toHaveLength(1)
  })

  it('zeigt bei leerem Bestand nur eine klare Meldung und einen optionalen Tipp', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}>
        <RecommendationPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Kein geeigneter vorhandener Köder')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mit diesem Plan ans Wasser' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Nicht in deiner Köderbox')).toHaveLength(1)
  })

  it('löscht abgeschlossene Sessions ohne Browserdialog erst nach Bestätigung und dauerhaft', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.complete(session.id)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Session-Aktionen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(sessionStore.getSnapshot()).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Session-Aktionen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Endgültig löschen' }))
    expect(screen.getByText('Noch kein Eintrag im Logbuch')).toBeInTheDocument()
    sessionStore.refresh()
    expect(sessionStore.getSnapshot()).toHaveLength(0)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('unterscheidet Scrollen, kurze Gesten und Linkswischen; Wischen löscht noch nichts', () => {
    sessionStore.create(conditions, createRecommendations(conditions)[0])
    const { container } = render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    )
    const row = container.querySelector('.session-swipe-content')!
    const swipe = (x: number, y: number) => {
      fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 100 }] })
      fireEvent.touchMove(row, { touches: [{ clientX: x, clientY: y }] })
      fireEvent.touchEnd(row)
    }
    swipe(190, 200)
    expect(screen.queryByText('Endgültig löschen')).not.toBeInTheDocument()
    swipe(175, 102)
    expect(screen.queryByText('Endgültig löschen')).not.toBeInTheDocument()
    swipe(100, 105)
    expect(screen.getByRole('button', { name: 'Endgültig löschen' })).toBeInTheDocument()
    expect(sessionStore.getSnapshot()).toHaveLength(1)
  })

  it('behält die Session bei einem Schreibfehler und erlaubt erneutes Löschen', () => {
    sessionStore.create(conditions, createRecommendations(conditions)[0])
    render(
      <MemoryRouter>
        <SessionsPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Session-Aktionen' }))
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Endgültig löschen' }))
    expect(sessionStore.getSnapshot()).toHaveLength(1)
    expect(screen.getByText(/Löschen fehlgeschlagen/)).toBeInTheDocument()
    write.mockRestore()
    fireEvent.click(screen.getByRole('button', { name: 'Endgültig löschen' }))
    expect(sessionStore.getSnapshot()).toHaveLength(0)
  })
})
