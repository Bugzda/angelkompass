interface UpdateActions {
  activate: () => Promise<void>
  reload: () => void
  canReload: () => boolean
  offer: (apply: () => Promise<void>) => void
}

/** Another tab may activate a waiting worker; only this tab can consent to reload. */
export function createPwaUpdateFlow(actions: UpdateActions) {
  let requestedHere = false
  let activated = false
  const apply = async () => {
    if (!actions.canReload()) throw new Error('Beende zuerst die aktive Session.')
    requestedHere = true
    if (activated) { actions.reload(); return }
    try { await actions.activate() }
    catch (error) { requestedHere = false; throw error }
  }
  return {
    available() { actions.offer(apply) },
    activated() {
      activated = true
      if (requestedHere && actions.canReload()) actions.reload()
      else actions.offer(apply)
    },
  }
}
