import { analyzeInventoryGaps } from '../../domain/engine/inventoryGaps'
import type { InventoryItem, TargetFish } from '../../domain/models/types'

type Request = { id: number; fish: TargetFish; inventory: InventoryItem[] }
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null
  postMessage: (message: unknown) => void
}

// Runs the lure box analysis off the main thread so scrolling and taps stay smooth on phones.
scope.onmessage = event => {
  const { id, fish, inventory } = event.data
  scope.postMessage({ id, result: analyzeInventoryGaps(fish, inventory) })
}
