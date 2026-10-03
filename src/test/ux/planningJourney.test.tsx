import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Conditions } from '../../domain/models/types'
import { createRecommendations } from '../../domain/engine/scoring'
import { HomePage } from '../../features/home/HomePage'
import { SituationPage } from '../../features/situation/SituationPage'
import { InventoryPage } from '../../features/inventory/InventoryPage'
import { RecommendationPage } from '../../features/recommendations/RecommendationPage'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { sessionStore } from '../../features/sessions/sessionStore'
import { Layout } from '../../ui/components/Layout'
import { pwaStatusStore } from '../../ui/hooks/usePwaStatus'

const conditions:Conditions={targetFish:'zander',waterType:'lake',season:'autumn',timeOfDay:'night',turbidity:'clear',depth:'shallow',light:'dark',waterTemperature:'mild',activity:{status:'unknown',signs:[]},vegetation:'none',observedStructure:[],structureStatus:'none'}
const stock=()=>localStorage.setItem('angelkompass.inventory.v3',JSON.stringify({schemaVersion:3,items:[{targetFish:'zander',lureTypeId:'jig',sizes:['medium']}]}))
function Journey({path='/neu/zander',state=conditions}:{path?:string;state?:Conditions}){
  return <MemoryRouter initialEntries={[{pathname:path,state}]}><Routes><Route path="/" element={<HomePage/>}/><Route path="/neu/:fish" element={<SituationPage/>}/><Route path="/bestand" element={<InventoryPage/>}/><Route path="/empfehlung" element={<RecommendationPage/>}/><Route path="/session/:id/karte" element={<WaterCardPage/>}/></Routes></MemoryRouter>
}
beforeEach(()=>{localStorage.clear();sessionStore.resetForTests();vi.stubGlobal('matchMedia',vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))})
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals()})

describe('Geführter Angelplan',()=>{
  it('führt ohne Bestand von den Bedingungen zur passenden Köderauswahl und erhält den Entwurf',()=>{
    render(<Journey/>)
    expect(screen.getByText('Noch keine Köder ausgewählt')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Tief'}))
    fireEvent.click(screen.getByRole('link',{name:'Köder auswählen'}))
    expect(screen.getByRole('region',{name:'Zander'})).toBeInTheDocument()
    expect(screen.queryByRole('heading',{name:'Barsch'})).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Zander Zander-Gummifisch: Mittel · 10–13 cm'}))
    fireEvent.click(screen.getByRole('link',{name:'Weiter zu den Bedingungen'}))
    expect(screen.getByRole('button',{name:'Tief'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByText('1 Ködertyp bereit')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:/Empfehlungen berechnen/}))
    fireEvent.click(screen.getByRole('button',{name:'Mit diesem Plan ans Wasser'}))
    expect(screen.getByRole('group',{name:'Rückmeldung erfassen'})).toBeInTheDocument()
    expect(sessionStore.getSnapshot()[0].conditions.depth).toBe('deep')
  })
  it('löst den leeren Empfehlungszustand ohne Verlust der Bedingungen auf',()=>{
    render(<Journey path="/empfehlung"/>)
    expect(screen.queryByRole('button',{name:'Mit diesem Plan ans Wasser'})).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link',{name:'Passende Köder auswählen'}))
    fireEvent.click(screen.getByRole('button',{name:'Zander Zander-Wobbler: Klein · 7–10 cm'}))
    fireEvent.click(screen.getByRole('link',{name:'Zurück zum Angelplan'}))
    expect(screen.getByRole('button',{name:'Mit diesem Plan ans Wasser'})).toBeEnabled()
    const compromise=screen.getByText(/Verwendet wird deine vorhandene Größe/)
    expect(compromise).toBeVisible()
    expect(compromise).toHaveTextContent('vorhandene Größe Klein')
    fireEvent.click(screen.getByRole('button',{name:'Mit diesem Plan ans Wasser'}))
    expect(sessionStore.getSnapshot()[0].conditions).toEqual(conditions)
    expect(sessionStore.getSnapshot()[0].recommendation.setup.size).toBe('small')
  })
  it('übernimmt beim Hecht keine alte Sicherheitsbestätigung für eine neue Session',()=>{
    const pike:Conditions={...conditions,targetFish:'pike',pikeSafetyConfirmed:true}
    const session=sessionStore.create(pike,createRecommendations(pike)[0])!
    sessionStore.complete(session.id)
    render(<Journey path="/"/>)
    fireEvent.click(screen.getByRole('link',{name:'Letzten Plan als Vorlage nutzen'}))
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('button',{name:/Empfehlungen berechnen/})).toBeDisabled()
    fireEvent.click(screen.getByRole('button',{name:/Zeit ändern:/}))
    expect(screen.getByRole('button',{name:'Nacht'})).toHaveAttribute('aria-pressed','true')
  })
  it('zeigt den Einstieg nur vor der ersten Session und führt aktive Pläne direkt ans Wasser',()=>{
    const view=render(<Journey path="/"/>)
    expect(screen.getByRole('heading',{name:'In drei Schritten ans Wasser.'})).toBeInTheDocument()
    act(()=>{sessionStore.create(conditions,createRecommendations(conditions)[0])})
    expect(screen.queryByRole('heading',{name:'In drei Schritten ans Wasser.'})).not.toBeInTheDocument()
    expect(screen.getByRole('link',{name:'Session fortsetzen'})).toHaveAttribute('href',`/session/${sessionStore.getSnapshot()[0].id}/karte`)
    view.unmount()
  })
  it('schließt auf der Am-Wasser-Karte ab und zeigt keine weiteren Arbeitsanweisungen',()=>{
    stock();render(<Journey path="/empfehlung"/>)
    fireEvent.click(screen.getByRole('button',{name:'Mit diesem Plan ans Wasser'}))
    fireEvent.click(screen.getByRole('button',{name:'Fang'}))
    fireEvent.click(screen.getByRole('button',{name:'Session beenden'}))
    expect(screen.getByRole('heading',{name:'Session abgeschlossen.'})).toBeInTheDocument()
    expect(screen.getByText(/Zander · 0 Bisse · 1 Fang/)).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'Fang'})).not.toBeInTheDocument()
    expect(screen.queryByText('JETZT')).not.toBeInTheDocument()
    expect(document.querySelector('.water-progress [aria-current]')).toBeNull()
    expect(sessionStore.getSnapshot()[0].status).toBe('completed')
  })
  it('bleibt bei fehlgeschlagener Speicherung auf der Karte und erlaubt einen neuen Versuch',()=>{
    const session=sessionStore.create(conditions,createRecommendations(conditions)[0])!
    render(<Journey path={`/session/${session.id}/karte`}/>)
    const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('Quota','QuotaExceededError')})
    fireEvent.click(screen.getByRole('button',{name:'Session beenden'}))
    expect(screen.getByRole('alert')).toHaveTextContent('nicht lokal gespeichert')
    expect(screen.queryByRole('heading',{name:'Session abgeschlossen.'})).not.toBeInTheDocument()
    expect(screen.queryByText(/Angelplan auf diesem Gerät gespeichert/)).not.toBeInTheDocument()
    write.mockRestore()
    fireEvent.click(screen.getByRole('button',{name:'Session beenden'}))
    expect(screen.getByRole('heading',{name:'Session abgeschlossen.'})).toBeInTheDocument()
  })
  it('blockiert auch den direkten Startknopf, wenn bereits ein Plan aktiv ist',()=>{
    stock();sessionStore.create(conditions,createRecommendations(conditions)[0])
    render(<Journey path="/empfehlung"/>)
    expect(screen.getByRole('button',{name:'Mit diesem Plan ans Wasser'})).toBeDisabled()
    expect(sessionStore.getSnapshot()).toHaveLength(1)
  })
  it('macht Netzwerkstatus und den aktiven Angelplan unabhängig von der Seite erreichbar',()=>{
    const session=sessionStore.create(conditions,createRecommendations(conditions)[0])!
    render(<MemoryRouter initialEntries={['/bestand']}><Routes><Route path="*" element={<Layout/>}/></Routes></MemoryRouter>)
    expect(screen.getByRole('link',{name:'Aktiver Plan'})).toHaveAttribute('href',`/session/${session.id}/karte`)
    act(()=>{pwaStatusStore.offlineReady();window.dispatchEvent(new Event('offline'))})
    expect(screen.getByRole('status')).toHaveTextContent('Offline verfügbar')
    act(()=>window.dispatchEvent(new Event('online')))
    expect(screen.getByRole('status')).toHaveTextContent('Offline bereit')
  })
})
