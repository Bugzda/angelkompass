/** Installation alone does not mean that the current page is controlled yet. */
export function observeOfflineReadiness(container: ServiceWorkerContainer, onReady: () => void) {
  let controller: ServiceWorker | null = null
  let finished = false

  const stop = () => {
    finished = true
    container.removeEventListener('controllerchange', check)
    controller?.removeEventListener('statechange', check)
  }
  const check = () => {
    if (finished) return
    if (container.controller !== controller) {
      controller?.removeEventListener('statechange', check)
      controller = container.controller
      controller?.addEventListener('statechange', check)
    }
    if (controller?.state === 'activated') {
      stop()
      onReady()
    }
  }

  container.addEventListener('controllerchange', check)
  check()
  return stop
}
