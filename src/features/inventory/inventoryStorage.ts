import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import { zanderLures } from '../../domain/catalogs/zanderLures'
import type { InventoryItem, LureType, SizeClass, TargetFish } from '../../domain/models/types'
import { isRecord } from '../../domain/models/validation'
import { INVENTORY_KEY } from '../data/storageKeys'
import { assertStorageReady } from '../data/storageTransaction'
export { INVENTORY_KEY } from '../data/storageKeys'

export const LEGACY_INVENTORY_KEYS = ['angelkompass.inventory.v2', 'angelkompass.inventory.v1'] as const
const catalogs: Record<TargetFish, LureType[]> = { perch: lures, pike: pikeLures, zander: zanderLures }
const isFish = (value: unknown): value is TargetFish => value === 'perch' || value === 'pike' || value === 'zander'
const isSize = (value: unknown): value is SizeClass => value === 'small' || value === 'medium' || value === 'large'
const lureFor = (fish: TargetFish, id: unknown) => catalogs[fish].find(lure => lure.id === id)
export const supportedSizes = (fish: TargetFish, id: LureType['id']) => lureFor(fish, id)?.sizes ?? []

export function isInventoryItem(value: unknown): value is InventoryItem {
  if (!isRecord(value) || !isFish(value.targetFish) || !Array.isArray(value.sizes) || !value.sizes.length) return false
  const lure = lureFor(value.targetFish, value.lureTypeId)
  return (
    Boolean(lure) &&
    value.sizes.every(size => isSize(size) && lure!.sizes.includes(size)) &&
    (value.migratedNeedsReview === undefined || typeof value.migratedNeedsReview === 'boolean')
  )
}

export function mergeInventory(items: readonly InventoryItem[]): InventoryItem[] {
  const merged = new Map<string, InventoryItem>()
  for (const item of items) {
    const key = `${item.targetFish}:${item.lureTypeId}`
    const previous = merged.get(key)
    const sizes = supportedSizes(item.targetFish, item.lureTypeId).filter(
      size => item.sizes.includes(size) || previous?.sizes.includes(size),
    )
    if (sizes.length)
      merged.set(key, {
        ...item,
        sizes,
        migratedNeedsReview: Boolean(previous?.migratedNeedsReview || item.migratedNeedsReview),
      })
  }
  return [...merged.values()]
}

export interface InventoryData {
  items: InventoryItem[]
  retained: unknown[]
}
export function parseInventory(raw: string): InventoryData {
  const value: unknown = JSON.parse(raw)
  if (!isRecord(value) || value.schemaVersion !== 3 || !Array.isArray(value.items))
    throw new Error('Ungültiges Bestandsformat')
  return {
    items: mergeInventory(value.items.filter(isInventoryItem)),
    retained: value.items.filter(item => !isInventoryItem(item)),
  }
}

/** Old keys stay intact; malformed legacy envelopes must never become an empty v3. */
export function loadInventory(): InventoryData {
  assertStorageReady()
  const current = localStorage.getItem(INVENTORY_KEY)
  if (current !== null) return parseInventory(current)
  const v2 = localStorage.getItem(LEGACY_INVENTORY_KEYS[0])
  const v1 = v2 === null ? localStorage.getItem(LEGACY_INVENTORY_KEYS[1]) : null
  if (v2 === null && v1 === null) return { items: [], retained: [] }
  const value: unknown = JSON.parse(v2 ?? v1!)
  let entries: unknown[]
  if (v2 !== null) {
    if (!isRecord(value) || value.schemaVersion !== 2 || !Array.isArray(value.items))
      throw new Error('Ungültiger Altbestand')
    entries = value.items
  } else {
    if (!Array.isArray(value)) throw new Error('Ungültiger Altbestand')
    entries = value
  }
  const items: InventoryItem[] = [],
    retained: unknown[] = []
  for (const entry of entries) {
    if (!isRecord(entry) || typeof entry.lureTypeId !== 'string') {
      retained.push(entry)
      continue
    }
    const oldSizes = Array.isArray(entry.sizes) ? entry.sizes.filter(isSize) : []
    const perch = lureFor('perch', entry.lureTypeId)
    const pike = v2 !== null ? lureFor('pike', entry.lureTypeId) : undefined
    let added = false
    if (perch) {
      const sizes =
        v2 !== null && oldSizes.length ? oldSizes.filter(size => perch.sizes.includes(size)) : [...perch.sizes]
      if (sizes.length) {
        items.push({ targetFish: 'perch', lureTypeId: perch.id, sizes, migratedNeedsReview: true })
        added = true
      }
    }
    if (pike) {
      const sizes = oldSizes.filter(size => size !== 'small' && pike.sizes.includes(size))
      if (sizes.length) {
        items.push({ targetFish: 'pike', lureTypeId: pike.id, sizes, migratedNeedsReview: true })
        added = true
      }
    }
    if (!added) retained.push(entry)
  }
  return { items: mergeInventory(items), retained }
}

export function inventoryWarning(data: InventoryData) {
  return data.retained.length
    ? `${data.retained.length} Bestandsangaben sind nicht lesbar. Sie bleiben unverändert gespeichert und sind in der vollständigen Datensicherung enthalten.`
    : undefined
}

export function readInventory(): InventoryItem[] {
  try {
    return loadInventory().items
  } catch {
    return []
  }
}
