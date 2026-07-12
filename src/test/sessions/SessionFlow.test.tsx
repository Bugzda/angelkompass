import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { SessionPage } from '../../features/sessions/SessionPage'
import { SessionsPage } from '../../features/sessions/SessionsPage'
import { sessionStore } from '../../features/sessions/sessionStore'

const conditions: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'autumn', timeOfDay: 'dusk', turbidity: 'slightly_turbid', depth: 'medium', waterTemperature: 'mild', light: 'diffuse', activity: { status: 'observed', signs: ['baitfish'] }, vegetation: 'edgeOrGaps', observedStructure: [] }

beforeEach(() => {
  localStorage.clear(); sessionStore.resetForTests()
  let id = 0; vi.stubGlobal('crypto', { randomUUID: () => `flow-${++id}` })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('Session-Nutzerablauf', () => {
  it('startet eine bewusst gewählte Top-3-Empfehlung und öffnet ihre Session', () => {
    render(<MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}><Routes><Route path="/empfehlung" element={<RecommendationPage />} /><Route path="/session/:id" element={<SessionPage />} /></Routes></MemoryRouter>)
    fireEvent.click(screen.getAllByRole('button', { name: 'Session mit dieser Empfehlung starten' })[1])
    expect(screen.getByText('Dein Versuch am Wasser.')).toBeInTheDocument()
    expect(sessionStore.getSnapshot()[0].recommendation.rank).toBe(2)
  })

  it('blockiert bei einer aktiven Session alle weiteren Starts', () => {
    sessionStore.create(conditions, createRecommendations(conditions)[0])
    render(<MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}><Routes><Route path="/empfehlung" element={<RecommendationPage />} /></Routes></MemoryRouter>)
    expect(screen.getByText('Eine Session ist bereits aktiv.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Session mit dieser Empfehlung starten' }).every((button) => button.hasAttribute('disabled'))).toBe(true)
  })

  it('kennzeichnet vorhandene und fehlende Top-3-Köder eindeutig', () => {
    const top = createRecommendations(conditions)
    localStorage.setItem('angelkompass.inventory.v1', JSON.stringify([{ lureTypeId: top[0].setup.lure.id }]))
    render(<MemoryRouter initialEntries={[{ pathname: '/empfehlung', state: conditions }]}><Routes><Route path="/empfehlung" element={<RecommendationPage />} /></Routes></MemoryRouter>)
    expect(screen.getAllByText('Im Bestand')).toHaveLength(1)
    expect(screen.getAllByText('Nicht im Bestand')).toHaveLength(2)
    expect(screen.getAllByText(/fachlichen Plan trotzdem als Session speichern/)).toHaveLength(2)
  })

  it('löscht erst nach bestätigter Rückfrage aus dem Verlauf', () => {
    sessionStore.create(conditions, createRecommendations(conditions)[0])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    render(<MemoryRouter><SessionsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Session löschen' }))
    expect(sessionStore.getSnapshot()).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Session löschen' }))
    expect(sessionStore.getSnapshot()).toHaveLength(0)
    expect(confirm).toHaveBeenCalledTimes(2)
  })
})
