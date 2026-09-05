import { describe, expect, it } from 'vitest'
import { applyPhotoReview, collectRegions, validatePhoto } from '../../features/photo/photoAnalysis'
import type { Conditions } from '../../domain/models/types'

const conditions: Conditions = { targetFish:'zander',waterType:'lake',season:'autumn',timeOfDay:'night',turbidity:'unknown',depth:'deep',waterTemperature:'unknown',light:'dark',activity:{status:'observed',signs:['baitfish']},vegetation:'none',observedStructure:['dropoff'],structureStatus:'observed' }
const segment = (label: string, data: number[]) => ({ label, mask:{ data:new Uint8ClampedArray(data), width:2, height:2 } })
describe('Lokale Fotoanalyse', () => {
  it('ordnet die offiziell definierten COCO-Sammelklassen zu, ohne Himmel als Wasser zu deuten', () => {
    const result=collectRegions([segment('LABEL_184',[255,0,0,0]),segment('LABEL_193',[0,255,0,0]),segment('LABEL_198',[0,0,255,0]),segment('LABEL_187',[0,0,0,255])])
    expect(result.regions.map(region => [region.kind,region.coverage])).toEqual([['plants',.5],['rocks',.25]])
  })
  it('fasst Masken zusammen, zählt Überschneidungen nur einmal und ignoriert unbekannte Klassen', () => {
    const result = collectRegions([segment('river',[255,255,0,0]),segment('water-other',[255,0,255,0]),segment('person',[0,0,0,255])])
    expect(result.regions).toHaveLength(1)
    expect(result.regions[0].kind).toBe('water')
    expect(result.regions[0].coverage).toBe(.75)
    expect([...result.regions[0].pixels]).toEqual([255,255,255,0])
  })
  it('behandelt fehlende und unpassende Erkennungen als leeres Ergebnis', () => {
    expect(collectRegions([]).regions).toEqual([])
    expect(collectRegions([segment('sky-other',[255,255,255,255])]).regions).toEqual([])
  })
  it('ändert ohne ausdrückliche Bestätigung keine Bedingungen', () => {
    expect(applyPhotoReview(conditions,{vegetation:'keep',hardCover:false})).toEqual(conditions)
  })
  it('ergänzt bestätigte Struktur und Kraut, erhält manuelle Angaben und Sicherheitsstatus', () => {
    const input:Conditions={...conditions,targetFish:'pike',pikeSafetyConfirmed:false}
    const updated=applyPhotoReview(input,{vegetation:'edgeOrGaps',hardCover:true})
    expect(updated).toEqual({...input,vegetation:'edgeOrGaps',observedStructure:['dropoff','hardCover']})
    expect(input.observedStructure).toEqual(['dropoff'])
    expect(applyPhotoReview(updated,{vegetation:'keep',hardCover:true})).toEqual(updated)
  })
  it('löst eine bisherige Keine-Struktur-Angabe auf, ohne beim Barsch ungültige Struktur zu ergänzen', () => {
    const input:Conditions={...conditions,observedStructure:[],structureStatus:'none'}
    expect(applyPhotoReview(input,{vegetation:'keep',hardCover:true}).structureStatus).toBe('observed')
    expect(applyPhotoReview({...input,targetFish:'perch'},{vegetation:'keep',hardCover:true}).observedStructure).toEqual([])
  })
  it('weist ungeeignete oder zu große Dateien vor dem Dekodieren ab', () => {
    expect(() => validatePhoto(new File(['x'],'test.svg',{type:'image/svg+xml'}))).toThrow(/JPEG/)
    expect(() => validatePhoto(new File([],'empty.jpg',{type:'image/jpeg'}))).toThrow(/20 MB/)
    expect(() => validatePhoto({type:'image/jpeg',size:21*1024*1024} as File)).toThrow(/20 MB/)
    expect(() => validatePhoto(new File(['image'],'lake.webp',{type:'image/webp'}))).not.toThrow()
  })
})
