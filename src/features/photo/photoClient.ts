import type { PhotoProgress, PhotoResult, WorkerReply } from './photoAnalysis'

export function analyzePhoto(data: ImageData, onProgress: (progress: PhotoProgress) => void) {
  const worker = new Worker(new URL('./photo.worker.ts', import.meta.url), { type: 'module' })
  let cancel = () => {}
  const result = new Promise<PhotoResult>((resolve, reject) => {
    const finish = () => { clearTimeout(timeout); worker.terminate() }
    const fail = () => {
      finish()
      reject(new Error('Die lokale Analyse konnte nicht abgeschlossen werden. Prüfe beim ersten Start deine Internetverbindung. Auf Geräten mit wenig Arbeitsspeicher kann das Modell zu groß sein. Du kannst es erneut versuchen oder deine Angaben selbst eintragen.'))
    }
    const timeout = setTimeout(fail, 180_000)
    cancel = () => { finish(); reject(new DOMException('Analyse abgebrochen', 'AbortError')) }
    worker.onerror = fail
    worker.onmessageerror = fail
    worker.onmessage = ({ data: message }: MessageEvent<WorkerReply>) => {
      if (message.type === 'progress') onProgress(message.progress)
      else if (message.type === 'result') { finish(); resolve(message.result) }
      else fail()
    }
    // Transfer a copy: the original remains available for retry after cancellation.
    const pixels = new Uint8ClampedArray(data.data)
    try { worker.postMessage({ data:pixels, width:data.width, height:data.height }, [pixels.buffer]) }
    catch { fail() }
  })
  return { result, cancel: () => cancel() }
}
