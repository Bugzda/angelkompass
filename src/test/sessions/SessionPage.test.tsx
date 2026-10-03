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
    fireEvent.click(screen.getByRole('button', { name: /Ohne Kontakt/ }))
    expect(sessionStore.getSnapshot()[0].progress).toBe('refine')
  })

  it('macht eine manuell abgeschlossene Session schreibgeschützt', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    render(<MemoryRouter initialEntries={[`/session/${session.id}`]}><Routes><Route path="/session/:id" element={<SessionPage />} /></Routes></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Session beenden' }))
    expect(screen.getByText('Abgeschlossen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Biss' })).not.toBeInTheDocument()
  })

  it('protokolliert nach dem Wechselplan weitere Fänge bis zum bewussten Abschluss', () => {
    const session=sessionStore.create(conditions,createRecommendations(conditions)[0])!
    for(let i=0;i<3;i++)sessionStore.addFeedback(session.id,'no_success')
    render(<MemoryRouter initialEntries={[`/session/${session.id}`]}><Routes><Route path="/session/:id" element={<SessionPage/>}/></Routes></MemoryRouter>)
    expect(screen.queryByRole('button',{name:/Ohne Kontakt/})).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Fang'}))
    expect(screen.getByText(/Nach dem Wechselplan/)).toBeVisible()
    fireEvent.click(screen.getByRole('button',{name:'Letzte Rückmeldung rückgängig machen'}))
    expect(sessionStore.getSnapshot()[0].progress).toBe('exhausted')
    fireEvent.click(screen.getByRole('button',{name:'Session beenden'}))
    expect(screen.queryByRole('button',{name:'Fang'})).not.toBeInTheDocument()
  })

  it('zeigt für eine fehlende Session einen klaren Rückweg',()=>{
    render(<MemoryRouter initialEntries={['/session/fehlt']}><Routes><Route path="/session/:id" element={<SessionPage/>}/></Routes></MemoryRouter>)
    expect(screen.getByRole('heading',{name:'Session nicht gefunden'})).toBeInTheDocument()
    expect(screen.getByRole('link',{name:'Zum Logbuch'})).toHaveAttribute('href','/verlauf')
  })

  it('zeigt einen alten v1-Snapshot ohne resolvedPresentation unverändert an',()=>{
    const session=sessionStore.create(conditions,createRecommendations(conditions)[0])!
    const envelope=JSON.parse(localStorage.getItem('angelkompass.sessions.v1')!)
    delete envelope.sessions[0].recommendation.setup.resolvedPresentation
    envelope.sessions[0].rulesetVersion='perch-lake-1.0.0'
    envelope.sessions[0].recommendation.setup.lure.mounting='Gespeicherte Legacy-Montage'
    envelope.sessions[0].recommendation.setup.lure.guidance='Gespeicherte Legacy-Führung'
    localStorage.setItem('angelkompass.sessions.v1',JSON.stringify(envelope));sessionStore.resetForTests()
    render(<MemoryRouter initialEntries={[`/session/${session.id}`]}><Routes><Route path="/session/:id" element={<SessionPage/>}/></Routes></MemoryRouter>)
    expect(screen.getByText('Gespeicherte Legacy-Montage')).toBeInTheDocument()
    expect(screen.getByText('Gespeicherte Legacy-Führung')).toBeInTheDocument()
  })
})
