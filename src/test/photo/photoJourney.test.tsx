import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PhotoAnalysisPage } from '../../features/photo/PhotoAnalysisPage'
import { SituationPage } from '../../features/situation/SituationPage'
import { analyzePhoto } from '../../features/photo/photoClient'
import { preparePhoto, type PhotoResult } from '../../features/photo/photoAnalysis'
import type { Conditions } from '../../domain/models/types'

vi.mock('../../features/photo/photoClient', () => ({ analyzePhoto:vi.fn() }))
vi.mock('../../features/photo/photoAnalysis', async importOriginal => ({ ...await importOriginal<object>(), preparePhoto:vi.fn() }))
const conditions:Conditions={targetFish:'zander',waterType:'lake',season:'autumn',timeOfDay:'night',depth:'deep',turbidity:'clear',waterTemperature:'mild',light:'dark',vegetation:'none',observedStructure:[],structureStatus:'none',activity:{status:'unknown',signs:[]}}
const photoResult:PhotoResult={width:1,height:1,regions:[{kind:'plants',coverage:1,pixels:new Uint8ClampedArray([255])}]}
let complete: (result:PhotoResult) => void
let cancel: ReturnType<typeof vi.fn>
function renderPhoto(state:unknown=conditions) {
  return render(<MemoryRouter initialEntries={[{pathname:'/neu/zander/foto',state}]}><Routes><Route path="/neu/:fish/foto" element={<PhotoAnalysisPage/>}/><Route path="/neu/:fish" element={<SituationPage/>}/></Routes></MemoryRouter>)
}
async function upload() {
  fireEvent.change(screen.getByLabelText('Uferfoto auswählen'),{target:{files:[new File(['x'],'lake.jpg',{type:'image/jpeg'})]}})
  await waitFor(() => expect(screen.getByRole('button',{name:'Lokal analysieren'})).toBeEnabled())
}
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('URL',Object.assign(URL,{revokeObjectURL:vi.fn()}))
  vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({createImageData:() => ({data:new Uint8ClampedArray(4)}),putImageData:vi.fn()} as unknown as CanvasRenderingContext2D)
  vi.mocked(preparePhoto).mockResolvedValue({url:'blob:test',data:{data:new Uint8ClampedArray(4),width:1,height:1} as ImageData})
  cancel=vi.fn()
  vi.mocked(analyzePhoto).mockImplementation(() => ({cancel,result:new Promise(resolve => {complete=resolve})}))
})
afterEach(() => { cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.clearAllMocks() })
describe('Fotoanalyse im Angelplan', () => {
  it('fordert vor der Übernahme eine eigene Bestätigung und erhält die übrigen Angaben', async () => {
    renderPhoto();await upload()
    expect(analyzePhoto).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button',{name:'Lokal analysieren'}))
    await act(async () => {complete(photoResult)})
    expect(screen.getByRole('button',{name:'Geprüfte Beobachtungen übernehmen'})).toBeDisabled()
    fireEvent.click(screen.getByRole('radio',{name:'Ich sehe eine Krautkante oder Lücken im Wasser'}))
    fireEvent.click(screen.getByRole('button',{name:'Geprüfte Beobachtungen übernehmen'}))
    expect(screen.getByRole('button',{name:'Lockere Kante/Lücken'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByRole('button',{name:'Tief'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByRole('button',{name:'Nacht'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByRole('button',{name:'Keine weitere Struktur vorhanden'})).toHaveAttribute('aria-pressed','true')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
  it('ignoriert verspätete Ergebnisse nach Abbruch und kann erneut starten', async () => {
    renderPhoto();await upload()
    fireEvent.click(screen.getByRole('button',{name:'Lokal analysieren'}))
    fireEvent.click(screen.getByRole('button',{name:'Abbrechen'}))
    expect(cancel).toHaveBeenCalledOnce()
    await act(async () => {complete(photoResult)})
    expect(screen.queryByRole('heading',{name:'Was trifft vor Ort zu?'})).not.toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Lokal analysieren'})).toBeEnabled()
  })
  it('bietet bei fehlenden Erkennungen keine erfundenen Beobachtungen an', async () => {
    renderPhoto();await upload()
    fireEvent.click(screen.getByRole('button',{name:'Lokal analysieren'}))
    await act(async () => {complete({width:1,height:1,regions:[]})})
    expect(screen.getByRole('heading',{name:'Keine passenden Bereiche erkannt.'})).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:'Geprüfte Beobachtungen übernehmen'})).not.toBeInTheDocument()
  })
  it('zeigt Dateifehler, ohne das Modell zu starten', async () => {
    vi.mocked(preparePhoto).mockRejectedValueOnce(new Error('Ungültiges Foto'))
    renderPhoto()
    fireEvent.change(screen.getByLabelText('Uferfoto auswählen'),{target:{files:[new File(['x'],'lake.jpg')]}})
    expect(await screen.findByRole('alert')).toHaveTextContent('Ungültiges Foto')
    expect(analyzePhoto).not.toHaveBeenCalled()
  })
  it('bietet bei reiner Wassererkennung keinen unmöglichen Bestätigungsschritt an', async () => {
    renderPhoto();await upload()
    fireEvent.click(screen.getByRole('button',{name:'Lokal analysieren'}))
    await act(async () => {complete({width:1,height:1,regions:[{kind:'water',coverage:1,pixels:new Uint8ClampedArray([255])}]})})
    expect(screen.queryByRole('button',{name:'Geprüfte Beobachtungen übernehmen'})).not.toBeInTheDocument()
    expect(screen.getByText(/Diese Markierungen ergänzen keine Bedingungen/)).toBeInTheDocument()
  })
  it('führt einen direkten Aufruf ohne Plan sicher zur Bedingungseingabe', () => {
    renderPhoto(null)
    expect(screen.getByRole('heading',{name:'Was siehst du am Wasser?'})).toBeInTheDocument()
    expect(analyzePhoto).not.toHaveBeenCalled()
  })
})
