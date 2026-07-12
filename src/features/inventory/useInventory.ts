import { useEffect, useState } from 'react'
import type { InventoryItem, LureType, SizeClass } from '../../domain/models/types'

const STORAGE_KEY = 'angelkompass.inventory.v2'
const LEGACY_KEY = 'angelkompass.inventory.v1'
const ALL_SIZES: SizeClass[] = ['small', 'medium', 'large']

function readInventory(): InventoryItem[] {
  try {
    const stored=localStorage.getItem(STORAGE_KEY)
    if(stored){const value=JSON.parse(stored) as {schemaVersion?:number;items?:InventoryItem[]};return value?.schemaVersion===2&&Array.isArray(value.items)?value.items:[]}
    const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)??'[]') as InventoryItem[]
    return Array.isArray(legacy)?legacy.filter(item=>item&&typeof item.lureTypeId==='string').map(item=>({lureTypeId:item.lureTypeId,legacyPerch:true})):[]
  } catch {
    return []
  }
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(readInventory)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({schemaVersion:2,items:inventory})), [inventory])
  const toggle = (lureTypeId: LureType['id']) => setInventory((current) => current.some((item) => item.lureTypeId === lureTypeId) ? current.filter((item) => item.lureTypeId !== lureTypeId) : [...current, { lureTypeId }])
  const toggleSize=(lureTypeId:LureType['id'],size:SizeClass)=>setInventory(current=>{const found=current.find(item=>item.lureTypeId===lureTypeId);if(!found)return[...current,{lureTypeId,sizes:[size]}];const sizes=found.sizes?.includes(size)?found.sizes.filter(item=>item!==size):[...(found.sizes??[]),size];return current.map(item=>item.lureTypeId===lureTypeId?{...item,sizes,legacyPerch:false}:item).filter(item=>item.lureTypeId!==lureTypeId||item.legacyPerch||item.sizes?.length)})
  const toggleAllSizes=(lureTypeId:LureType['id'])=>setInventory(current=>{const found=current.find(item=>item.lureTypeId===lureTypeId);const hasAll=found?.sizes?.length===ALL_SIZES.length&&ALL_SIZES.every(size=>found.sizes?.includes(size));if(hasAll)return current.filter(item=>item.lureTypeId!==lureTypeId);if(!found)return[...current,{lureTypeId,sizes:[...ALL_SIZES]}];return current.map(item=>item.lureTypeId===lureTypeId?{...item,sizes:[...ALL_SIZES],legacyPerch:false}:item)})
  return { inventory, toggle, toggleSize, toggleAllSizes }
}
