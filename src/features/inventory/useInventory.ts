import { useEffect, useState } from 'react'
import type { InventoryItem, LureType } from '../../domain/models/types'

const STORAGE_KEY = 'angelkompass.inventory.v1'

function readInventory(): InventoryItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as InventoryItem[]
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(readInventory)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory)), [inventory])
  const toggle = (lureTypeId: LureType['id']) => setInventory((current) => current.some((item) => item.lureTypeId === lureTypeId) ? current.filter((item) => item.lureTypeId !== lureTypeId) : [...current, { lureTypeId }])
  return { inventory, toggle }
}
