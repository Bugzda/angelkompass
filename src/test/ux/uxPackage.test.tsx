import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { HomePage } from '../../features/home/HomePage'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { SessionsPage } from '../../features/sessions/SessionsPage'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { sessionStore } from '../../features/sessions/sessionStore'

const conditions: Conditions = { targetFish:'perch',waterType:'lake',season:'summer',timeOfDay:'dusk',turbidity:'clear',depth:'medium',waterTemperature:'mild',light:'diffuse',activity:{status:'none',signs:[]},vegetation:'edgeOrGaps',observedStructure:[] }

beforeEach(()=>{localStorage.clear();sessionStore.resetForTests();vi.stubGlobal('crypto',{randomUUID:()=>`ux-${Math.random()}`})})
afterEach(()=>{cleanup();vi.restoreAllMocks()})

describe('UX-Paket',()=>{
  it('zeigt eine aktive Session auf der Startseite mit Fortsetzen-Aktion',()=>{
    sessionStore.create(conditions,createRecommendations(conditions)[0])
    render(<MemoryRouter><HomePage/></MemoryRouter>)
    expect(screen.getByText('AKTIVE SESSION')).toBeInTheDocument()
    expect(screen.getByRole('link',{name:/Session fortsetzen/})).toHaveAttribute('href',expect.stringMatching(/^\/session\//))
  })

  it('bietet im leeren Verlauf direkt die erste Session an',()=>{
    render(<MemoryRouter><SessionsPage/></MemoryRouter>)
    expect(screen.getByRole('link',{name:'Erste Session starten'})).toHaveAttribute('href','/neu')
  })

  it('öffnet nur Rang 1 und macht weitere Karten per Akkordeon zugänglich',()=>{
    const top=createRecommendations(conditions);localStorage.setItem('angelkompass.inventory.v1',JSON.stringify(top.map(item=>({lureTypeId:item.setup.lure.id}))))
    render(<MemoryRouter initialEntries={[{pathname:'/empfehlung',state:conditions}]}><RecommendationPage/></MemoryRouter>)
    const close=screen.getByRole('button',{name:/Details schließen/})
    const open=screen.getAllByRole('button',{name:/Details anzeigen/})
    expect(close).toHaveAttribute('aria-expanded','true')
    expect(open).toHaveLength(2)
    fireEvent.click(open[0])
    expect(screen.getAllByRole('button',{name:'Session mit dieser Empfehlung starten'})).toHaveLength(2)
  })

  it('zeigt die gespeicherte Empfehlung und schreibt Feedback in der Am-Wasser-Karte',()=>{
    const session=sessionStore.create(conditions,createRecommendations(conditions)[0])!
    render(<MemoryRouter initialEntries={[`/session/${session.id}/karte`]}><Routes><Route path="/session/:id/karte" element={<WaterCardPage/>}/></Routes></MemoryRouter>)
    expect(screen.getByText(session.recommendation.setup.lure.label)).toBeInTheDocument()
    expect(screen.getByRole('group',{name:'Rückmeldung erfassen'})).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Kein Erfolg →'}))
    expect(sessionStore.getSnapshot()[0].progress).toBe('refine')
    expect(screen.getByText(session.recommendation.switchPlan[1].title)).toBeInTheDocument()
  })

  it('führt auch aus einer fehlenden Am-Wasser-Karte verständlich zurück',()=>{
    render(<MemoryRouter initialEntries={['/session/fehlt/karte']}><Routes><Route path="/session/:id/karte" element={<WaterCardPage/>}/></Routes></MemoryRouter>)
    expect(screen.getByRole('heading',{name:'Session nicht gefunden'})).toBeInTheDocument()
    expect(screen.getByRole('link',{name:'Zum Verlauf'})).toHaveAttribute('href','/verlauf')
  })
})
