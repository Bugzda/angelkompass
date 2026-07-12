import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { SessionPage } from '../../features/sessions/SessionPage'
import { sessionStore } from '../../features/sessions/sessionStore'

const conditions: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'summer', timeOfDay: 'day', turbidity: 'clear', depth: 'shallow', waterTemperature: 'warm', light: 'bright', activity: { status: 'none', signs: [] }, vegetation: 'none', observedStructure: [] }

beforeEach(() => {
  localStorage.clear(); sessionStore.resetForTests()
  let id = 0; vi.stubGlobal('crypto', { randomUUID: () => `ui-${++id}` })
})
afterEach(cleanup)

describe('Sessionansicht', () => {
  it('protokolliert Feedback und schaltet nur bei keinem Erfolg weiter', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    render(<MemoryRouter initialEntries={[`/session/${session.id}`]}><Routes><Route path="/session/:id" element={<SessionPage />} /></Routes></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Biss' }))
    expect(screen.getByText('Rückmeldungen')).toBeInTheDocument()
    expect(sessionStore.getSnapshot()[0].progress).toBe('initial')
    fireEvent.click(screen.getByRole('button', { name: /Kein Erfolg/ }))
    expect(sessionStore.getSnapshot()[0].progress).toBe('refine')
  })

  it('macht eine manuell abgeschlossene Session schreibgeschützt', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    render(<MemoryRouter initialEntries={[`/session/${session.id}`]}><Routes><Route path="/session/:id" element={<SessionPage />} /></Routes></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Session beenden' }))
    expect(screen.getByText('Abgeschlossen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Biss' })).not.toBeInTheDocument()
  })
})
