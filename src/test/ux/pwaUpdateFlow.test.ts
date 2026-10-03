import { describe, expect, it, vi } from 'vitest'
import { createPwaUpdateFlow } from '../../app/pwaUpdateFlow'

function harness() {
  const actions = {
    activate: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn(),
    canReload: vi.fn().mockReturnValue(true),
    offer: vi.fn(),
  }
  const flow = createPwaUpdateFlow(actions)
  flow.available()
  const apply = () => actions.offer.mock.lastCall![0]() as Promise<void>
  return { actions, flow, apply }
}

describe('PWA updates without interrupting sessions', () => {
  it('reloads after activation only when this tab requested the update', async () => {
    const { actions, flow, apply } = harness()
    expect(actions.reload).not.toHaveBeenCalled()
    await apply()
    expect(actions.activate).toHaveBeenCalledOnce()
    expect(actions.reload).not.toHaveBeenCalled()
    flow.activated()
    expect(actions.reload).toHaveBeenCalledOnce()
  })
  it('offers a reload when another tab activates the worker', async () => {
    const { actions, flow, apply } = harness()
    flow.activated()
    expect(actions.reload).not.toHaveBeenCalled()
    await apply()
    expect(actions.reload).toHaveBeenCalledOnce()
    expect(actions.activate).not.toHaveBeenCalled()
  })
  it('blocks updates during a session, including a session started during activation', async () => {
    const { actions, flow, apply } = harness()
    actions.canReload.mockReturnValue(false)
    await expect(apply()).rejects.toThrow(/aktive Session/)
    expect(actions.activate).not.toHaveBeenCalled()
    actions.canReload.mockReturnValue(true)
    await apply()
    actions.canReload.mockReturnValue(false)
    flow.activated()
    expect(actions.reload).not.toHaveBeenCalled()
    actions.canReload.mockReturnValue(true)
    await apply()
    expect(actions.reload).toHaveBeenCalledOnce()
  })
  it('does not retain consent after activation failed', async () => {
    const { actions, flow, apply } = harness()
    actions.activate.mockRejectedValueOnce(new Error('offline'))
    await expect(apply()).rejects.toThrow('offline')
    flow.activated()
    expect(actions.reload).not.toHaveBeenCalled()
  })
})
