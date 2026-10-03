import { useEffect, useRef, useState } from 'react'
import { analyzeInventoryGaps, type InventoryGapAnalysis } from '../../domain/engine/inventoryGaps'
import type { InventoryItem, TargetFish } from '../../domain/models/types'

/** While recalculating, the previous result stays available so the page does not jump. */
type State = { status: 'running' | 'done' | 'error'; result?: InventoryGapAnalysis }

function createWorker(): Worker | undefined {
  if (typeof Worker === 'undefined') return undefined
  try {
    return new Worker(new URL('./gapAnalysis.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    return undefined
  }
}

/** Runs the analysis in a Web Worker; without worker support it runs once on the main thread after paint. */
export function useGapAnalysis(fish: TargetFish, inventory: InventoryItem[]): State {
  const [state, setState] = useState<State>({ status: 'running' })
  const worker = useRef<Worker | undefined>(undefined)
  const request = useRef(0)
  const key = JSON.stringify(inventory.filter(item => item.targetFish === fish))
  useEffect(() => {
    worker.current = createWorker()
    return () => worker.current?.terminate()
  }, [])
  useEffect(() => {
    const id = ++request.current
    const items = JSON.parse(key) as InventoryItem[]
    setState(previous => ({ status: 'running', result: previous.result }))
    const fallback = () =>
      window.setTimeout(() => {
        if (id !== request.current) return
        try {
          setState({ status: 'done', result: analyzeInventoryGaps(fish, items) })
        } catch {
          setState({ status: 'error' })
        }
      }, 0)
    const current = worker.current
    if (!current) {
      const timer = fallback()
      return () => window.clearTimeout(timer)
    }
    let timer: number | undefined
    const onMessage = (event: MessageEvent<{ id: number; result: InventoryGapAnalysis }>) => {
      if (event.data.id === id) setState({ status: 'done', result: event.data.result })
    }
    const onError = () => {
      worker.current?.terminate()
      worker.current = undefined
      timer = fallback()
    }
    current.addEventListener('message', onMessage)
    current.addEventListener('error', onError)
    current.postMessage({ id, fish, inventory: items })
    return () => {
      current.removeEventListener('message', onMessage)
      current.removeEventListener('error', onError)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [fish, key])
  return state
}
