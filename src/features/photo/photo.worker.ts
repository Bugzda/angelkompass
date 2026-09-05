import { env, pipeline, RawImage } from '@huggingface/transformers'
import wasmUrl from '../../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm?url'
import runtimeUrl from '../../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs?url'
import { collectRegions, PHOTO_MODEL, PHOTO_REVISION, type WorkerReply } from './photoAnalysis'

const send = (message: WorkerReply) => self.postMessage(message)
// A dedicated worker keeps the form responsive and permits immediate cancellation.
env.allowLocalModels = false
env.useBrowserCache = false
env.backends.onnx.wasm!.numThreads = 1
env.backends.onnx.wasm!.proxy = false
env.backends.onnx.wasm!.wasmPaths = {
  wasm: new URL(wasmUrl, self.location.origin).href,
  mjs: new URL(runtimeUrl, self.location.origin).href,
}
self.onmessage = async (event: MessageEvent<{ data: Uint8ClampedArray; width: number; height: number }>) => {
  try {
    try {
      env.customCache = await caches.open('angelkompass-photo-model-v1')
      env.useCustomCache = true
    } catch { /* Private browsing may disable caching; online inference still works. */ }
    send({ type:'progress', progress:{ phase:'loading' } })
    const segmenter = await pipeline('image-segmentation', PHOTO_MODEL, {
      // q8 produced unstable landscape masks in browser validation; retain full precision.
      revision: PHOTO_REVISION, device: 'wasm', dtype: 'fp32',
      progress_callback: progress => {
        if (progress.status === 'progress' && progress.file.endsWith('.onnx')) {
          send({ type:'progress', progress:{ phase:'loading', percent: Math.min(100, Math.round(progress.progress)) } })
        }
      },
    })
    if (!segmenter.processor.image_processor) throw new Error('Image processor unavailable')
    segmenter.processor.image_processor.size = { shortest_edge:640, longest_edge:960 }
    send({ type:'progress', progress:{ phase:'analyzing' } })
    const { data, width, height } = event.data
    const result = await segmenter(new RawImage(data, width, height, 4), { threshold: 0.7 })
    send({ type:'result', result:collectRegions(result) })
    await segmenter.dispose()
  } catch {
    send({ type:'error' })
  }
}
