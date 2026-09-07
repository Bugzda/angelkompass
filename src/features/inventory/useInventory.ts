import { useEffect, useState } from 'react'
import type { LureType, SizeClass, TargetFish } from '../../domain/models/types'
import { INVENTORY_KEY, LEGACY_INVENTORY_KEYS, inventoryWarning, loadInventory, readInventory, supportedSizes } from './inventoryStorage'
import { RESTORE_JOURNAL_KEY } from '../data/storageKeys'
export { readInventory } from './inventoryStorage'

export function useInventory() {
  const [inventory, setInventory] = useState(readInventory)
  const [error, setError] = useState<string>()
  useEffect(() => {
    const sync = () => {
      try {
        const data = loadInventory()
        setInventory(data.items)
        setError(inventoryWarning(data))
      } catch {
        setError('Der Bestand ist nicht lesbar. Bestehende Daten bleiben erhalten. Du kannst sie unter Datensicherung herunterladen.')
      }
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || [INVENTORY_KEY, RESTORE_JOURNAL_KEY, ...LEGACY_INVENTORY_KEYS].includes(event.key)) sync()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('angelkompass:inventory', sync)
    sync()
    try {
      if (localStorage.getItem(INVENTORY_KEY) === null) {
        const data = loadInventory()
        localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: [...data.items, ...data.retained] }))
      }
    } catch {
      setError('Der Bestand konnte nicht lokal gespeichert werden oder ist nicht lesbar. Bestehende Daten bleiben erhalten. Prüfe den Browser-Speicher.')
    }
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('angelkompass:inventory', sync) }
  }, [])
  const update = (change: (current: ReturnType<typeof readInventory>) => ReturnType<typeof readInventory>) => {
    try {
      const data = loadInventory()
      const next = change(data.items)
      // Keep unrecognized records intact, including data from newer versions.
      localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: [...next, ...data.retained] }))
      setInventory(next)
      setError(inventoryWarning(data))
      window.dispatchEvent(new Event('angelkompass:inventory'))
    } catch {
      setError('Der Bestand konnte nicht lokal gespeichert werden. Deine Änderung wurde nicht übernommen; bestehende Daten bleiben erhalten.')
    }
  }
  const toggleSize=(targetFish:TargetFish,lureTypeId:LureType['id'],size:SizeClass)=>update(current=>{
    const supported=supportedSizes(targetFish,lureTypeId)
    if(!supported.includes(size))return current
    const found=current.find(item=>item.targetFish===targetFish&&item.lureTypeId===lureTypeId)
    if(!found)return[...current,{targetFish,lureTypeId,sizes:[size],migratedNeedsReview:false}]
    const next=found.sizes.includes(size)?found.sizes.filter(item=>item!==size):[...found.sizes,size]
    return current.flatMap(item=>item!==found?[item]:next.length?[{...item,sizes:next,migratedNeedsReview:false}]:[])
  })
  const toggleAllSizes=(targetFish:TargetFish,lureTypeId:LureType['id'])=>update(current=>{
    const all=supportedSizes(targetFish,lureTypeId)
    if(!all.length)return current
    const found=current.find(item=>item.targetFish===targetFish&&item.lureTypeId===lureTypeId)
    const hasAll=Boolean(found)&&all.every(size=>found?.sizes.includes(size))
    if(hasAll)return current.filter(item=>item!==found)
    if(!found)return[...current,{targetFish,lureTypeId,sizes:[...all],migratedNeedsReview:false}]
    return current.map(item=>item===found?{...item,sizes:[...all],migratedNeedsReview:false}:item)
  })
  return{inventory,toggleSize,toggleAllSizes,error}
}
