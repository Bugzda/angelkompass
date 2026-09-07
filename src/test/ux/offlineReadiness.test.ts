import { describe, expect, it, vi } from 'vitest'
import { observeOfflineReadiness } from '../../app/offlineReadiness'

class Worker extends EventTarget {
  state: ServiceWorkerState = 'installed'
  transition(state: ServiceWorkerState) { this.state = state; this.dispatchEvent(new Event('statechange')) }
}
class Container extends EventTarget {
  controller: ServiceWorker | null = null
  control(worker: Worker | null) {
    this.controller = worker as unknown as ServiceWorker | null
    this.dispatchEvent(new Event('controllerchange'))
  }
}
const observe = (container: Container, callback: () => void) => observeOfflineReadiness(container as unknown as ServiceWorkerContainer, callback)

describe('offline readiness', () => {
  it('does not report an installed or activating worker as ready', () => {
    const container = new Container(), worker = new Worker(), ready = vi.fn()
    const stop = observe(container, ready)
    expect(ready).not.toHaveBeenCalled()
    container.control(worker)
    worker.transition('activating')
    expect(ready).not.toHaveBeenCalled()
    worker.transition('activated')
    expect(ready).toHaveBeenCalledTimes(1)
    worker.transition('activated')
    container.control(worker)
    expect(ready).toHaveBeenCalledTimes(1)
    stop()
  })

  it('recognizes an already activated controller on the next visit', () => {
    const container = new Container(), worker = new Worker(), ready = vi.fn()
    worker.transition('activated')
    container.control(worker)
    observe(container, ready)
    expect(ready).toHaveBeenCalledOnce()
  })

  it('ignores activation of a worker that no longer controls the page', () => {
    const container = new Container(), previous = new Worker(), current = new Worker(), ready = vi.fn()
    observe(container, ready)
    container.control(previous)
    container.control(current)
    previous.transition('activated')
    expect(ready).not.toHaveBeenCalled()
    current.transition('activated')
    expect(ready).toHaveBeenCalledOnce()
  })

  it('can stop observing before activation', () => {
    const container = new Container(), worker = new Worker(), ready = vi.fn()
    container.control(worker)
    const stop = observe(container, ready)
    stop()
    worker.transition('activated')
    container.control(worker)
    expect(ready).not.toHaveBeenCalled()
  })
})
