import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { beginPhotoAttempt, readPhotoAttempt, clearPhotoAttempt } from '../../features/photo/photoRecovery'
import { maskSize } from '../../features/photo/photoAnalysis'
import type { Conditions } from '../../domain/models/types'

const conditions: Conditions = { targetFish:'pike',waterType:'lake',season:'autumn',timeOfDay:'unknown',depth:'unknown',turbidity:'unknown',light:'unknown',waterTemperature:'unknown',activity:{status:'unknown',signs:[]},vegetation:'unknown',observedStructure:[],pikeSafetyConfirmed:false }
beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers();sessionStorage.clear() })
it('erhält nur den letzten unterbrochenen Entwurf und verwirft ihn nach 30 Minuten', () => {
  beginPhotoAttempt(conditions)
  expect(readPhotoAttempt()).toEqual(conditions)
  vi.advanceTimersByTime(30*60_000+1)
  expect(readPhotoAttempt()).toBeUndefined()
  beginPhotoAttempt(conditions)
  clearPhotoAttempt()
  expect(readPhotoAttempt()).toBeUndefined()
})
it('ignoriert beschädigte Wiederherstellungsdaten', () => {
  sessionStorage.setItem('angelkompass.photo-attempt.v1','broken')
  expect(readPhotoAttempt()).toBeUndefined()
  sessionStorage.setItem('angelkompass.photo-attempt.v1',JSON.stringify({started:Date.now(),conditions:{targetFish:'pike'}}))
  expect(readPhotoAttempt()).toBeUndefined()
})
it('begrenzt hoch- und querformatige Masken ohne Verzerrung oder unnötiges Hochskalieren', () => {
  expect(maskSize(1280,960)).toEqual([288,384])
  expect(maskSize(960,1280)).toEqual([384,288])
  expect(maskSize(200,100)).toEqual([100,200])
  expect(maskSize(1,1280)).toEqual([384,1])
})
