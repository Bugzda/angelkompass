import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { analyzePhoto } from '../../features/photo/photoClient'
import type { WorkerReply } from '../../features/photo/photoAnalysis'

class FakeWorker {
  static latest: FakeWorker
  onmessage?: (event:{data:WorkerReply}) => void
  onerror?: () => void
  onmessageerror?: () => void
  terminate = vi.fn()
  postMessage = vi.fn()
  constructor() { FakeWorker.latest = this }
}
const pixels = { data:new Uint8ClampedArray([1,2,3,255]), width:1,height:1 } as ImageData
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('Worker',FakeWorker) })
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
describe('Foto-Worker-Lebenszyklus', () => {
  it('meldet Fortschritt, liefert Ergebnisse und beendet den Worker', async () => {
    const progress=vi.fn(), job=analyzePhoto(pixels,progress), worker=FakeWorker.latest
    worker.onmessage?.({data:{type:'progress',progress:{phase:'analyzing'}}})
    expect(progress).toHaveBeenCalledWith({phase:'analyzing'})
    worker.onmessage?.({data:{type:'result',result:{width:1,height:1,regions:[]}}})
    await expect(job.result).resolves.toEqual({width:1,height:1,regions:[]})
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('bricht laufende Berechnungen ab und behält das Original für einen neuen Versuch', async () => {
    const job=analyzePhoto(pixels,vi.fn()), failure=expect(job.result).rejects.toMatchObject({name:'AbortError'})
    const sent=FakeWorker.latest.postMessage.mock.calls[0][0]
    expect(sent.data).not.toBe(pixels.data)
    job.cancel()
    await failure
    expect(FakeWorker.latest.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('beendet hängende Modell-Downloads mit einer verständlichen Fehlermeldung', async () => {
    const job=analyzePhoto(pixels,vi.fn()), failure=expect(job.result).rejects.toThrow(/Internetverbindung/)
    await vi.advanceTimersByTimeAsync(180_000)
    await failure
    expect(FakeWorker.latest.terminate).toHaveBeenCalledOnce()
  })
  it('räumt auch bei einem Fehler des Workers auf', async () => {
    const job=analyzePhoto(pixels,vi.fn()), failure=expect(job.result).rejects.toThrow(/lokale Analyse/)
    FakeWorker.latest.onerror?.()
    await failure
    expect(vi.getTimerCount()).toBe(0)
  })
})
