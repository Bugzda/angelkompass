import {beforeEach,describe,expect,it} from 'vitest'
import {fireEvent,render,screen} from '@testing-library/react'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import {SituationPage} from '../../features/situation/SituationPage'
import {useInventory} from '../../features/inventory/useInventory'
import {renderHook,act} from '@testing-library/react'
import {sessionStore} from '../../features/sessions/sessionStore'
import {createRecommendations} from '../../domain/engine/scoring'
import type {Conditions} from '../../domain/models/types'

describe('Hecht-Ablauf und Bestand v2',()=>{
 beforeEach(()=>localStorage.clear())
 it('blockiert die Hecht-Berechnung bis zur Sicherheitsbestätigung',()=>{render(<MemoryRouter initialEntries={['/neu/pike']}><Routes><Route path="/neu/:fish" element={<SituationPage/>}/><Route path="/empfehlung" element={<p>Ergebnis</p>}/></Routes></MemoryRouter>);const calculate=screen.getByRole('button',{name:/Drei Empfehlungen/});expect(calculate).toBeDisabled();fireEvent.click(screen.getByRole('checkbox'));expect(calculate).toBeEnabled();fireEvent.click(calculate);expect(screen.getByText('Ergebnis')).toBeInTheDocument()})
 it('migriert v1 verlustarm und ergänzt explizite Größen',()=>{localStorage.setItem('angelkompass.inventory.v1',JSON.stringify([{lureTypeId:'jig'},{lureTypeId:'spinner'},null]));const{result}=renderHook(()=>useInventory());expect(result.current.inventory).toEqual([{lureTypeId:'jig',legacyPerch:true},{lureTypeId:'spinner',legacyPerch:true}]);act(()=>result.current.toggleSize('jig','large'));expect(result.current.inventory.find(item=>item.lureTypeId==='jig')).toEqual({lureTypeId:'jig',legacyPerch:false,sizes:['large']});expect(JSON.parse(localStorage.getItem('angelkompass.inventory.v2')!).schemaVersion).toBe(2)})
 it('kann alle drei Größen gesammelt markieren und wieder entfernen',()=>{const{result}=renderHook(()=>useInventory());act(()=>result.current.toggleAllSizes('jig'));expect(result.current.inventory).toContainEqual({lureTypeId:'jig',sizes:['small','medium','large']});act(()=>result.current.toggleAllSizes('jig'));expect(result.current.inventory.some(item=>item.lureTypeId==='jig')).toBe(false)})
 it('verwirft beschädigte Bestandsdaten',()=>{localStorage.setItem('angelkompass.inventory.v1','{kaputt');const{result}=renderHook(()=>useInventory());expect(result.current.inventory).toEqual([])})
 it('speichert eine Hecht-Session als versionierten Snapshot',()=>{const conditions:Conditions={targetFish:'pike',waterType:'lake',season:'summer',timeOfDay:'day',turbidity:'clear',depth:'shallow',waterTemperature:'warm',light:'diffuse',activity:{status:'observed',signs:['baitfish']},vegetation:'edgeOrGaps',observedStructure:[],pikeSafetyConfirmed:true};sessionStore.resetForTests();const created=sessionStore.create(conditions,createRecommendations(conditions)[0]);expect(created?.rulesetVersion).toBe('pike-lake-1.0.0');expect(created?.conditions.pikeSafetyConfirmed).toBe(true)})
})
