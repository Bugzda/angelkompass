import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../../features/home/HomePage'
import { SituationPage } from '../../features/situation/SituationPage'
import { SpeciesPage } from '../../features/situation/SpeciesPage'
import { sessionStore } from '../../features/sessions/sessionStore'
import { Layout } from '../../ui/components/Layout'
import { pwaStatusStore } from '../../ui/hooks/usePwaStatus'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'

const conditions:Conditions={targetFish:'perch',waterType:'lake',season:'summer',timeOfDay:'day',turbidity:'slightly_turbid',depth:'medium',waterTemperature:'unknown',light:'unknown',activity:{status:'unknown',signs:[]},vegetation:'unknown',observedStructure:[]}

beforeEach(()=>{
  localStorage.clear();sessionStore.resetForTests();pwaStatusStore.dismissUpdate()
  vi.stubGlobal('matchMedia',vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))
})
afterEach(()=>{cleanup();vi.restoreAllMocks()})

describe('Terrain-Redesign',()=>{
  it('kündigt Zander auf der Startseite an, ohne ihn zu verlinken',()=>{
    render(<MemoryRouter><HomePage/></MemoryRouter>)
    expect(screen.getByText('Zander')).toBeInTheDocument()
    expect(screen.getByText('Bald verfügbar')).toBeInTheDocument()
    expect(screen.queryByRole('link',{name:/Zander/})).not.toBeInTheDocument()
  })

  it('zeigt eine deaktivierte Zander-Artkarte neben Barsch und Hecht',()=>{
    render(<MemoryRouter><SpeciesPage/></MemoryRouter>)
    expect(screen.getByText('3 Spots · 11 Ködertypen')).toBeInTheDocument()
    expect(screen.getByText('4 Spots · 9 Ködertypen')).toBeInTheDocument()
    expect(screen.getByRole('link',{name:/Barsch/})).toHaveAttribute('href','/neu/perch')
    expect(screen.getByRole('link',{name:/Hecht/})).toHaveAttribute('href','/neu/pike')
    const zander=screen.getByText('Zander').closest('article')
    expect(zander).toHaveAttribute('aria-disabled','true')
    expect(screen.queryByRole('link',{name:/Zander/})).not.toBeInTheDocument()
  })

  it('leitet eine manipulierte Zander-URL zurück zur Fischwahl',()=>{
    render(<MemoryRouter initialEntries={['/neu/zander']}><Routes><Route path="/neu" element={<SpeciesPage/>}/><Route path="/neu/:fish" element={<SituationPage/>}/></Routes></MemoryRouter>)
    expect(screen.getByRole('heading',{name:'Welchen Räuber suchst du?'})).toBeInTheDocument()
  })

  it.each([
    ['/', 'Start'],['/neu/perch','Neue Session'],['/empfehlung','Neue Session'],['/bestand','Bestand'],['/session/test/karte','Verlauf'],
  ])('markiert auf %s genau den logischen Navigationsbereich', (path,label)=>{
    render(<MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={<Layout/>}/></Routes></MemoryRouter>)
    const active=screen.getByRole('link',{name:label})
    expect(active).toHaveAttribute('aria-current','page')
    expect(document.querySelectorAll('.bottom a[aria-current="page"]')).toHaveLength(1)
    expect(active.querySelector('svg')).toHaveAttribute('aria-hidden','true')
    expect(document.querySelector('.bottom')?.textContent).not.toMatch(/[⌂⌁▣≡]/)
  })

  it('verhindert ein ungefragtes Update während einer aktiven Session',()=>{
    sessionStore.create(conditions,createRecommendations(conditions)[0])
    pwaStatusStore.updateReady(vi.fn().mockResolvedValue(undefined))
    render(<MemoryRouter><Routes><Route path="*" element={<Layout/>}/></Routes></MemoryRouter>)
    expect(screen.getByRole('button',{name:'Jetzt aktualisieren'})).toBeDisabled()
    expect(screen.getByText(/Während deiner aktiven Session/)).toBeInTheDocument()
  })
})
