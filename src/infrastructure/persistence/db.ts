import { openDB } from 'idb'; import type { FishingSession,InventoryItem } from '../../domain/models/types'
const DB='angelkompass'; const VERSION=1
const db=()=>openDB(DB,VERSION,{upgrade(database){if(!database.objectStoreNames.contains('inventory'))database.createObjectStore('inventory',{keyPath:'id'});if(!database.objectStoreNames.contains('sessions'))database.createObjectStore('sessions',{keyPath:'id'})}})
export const getInventory=async()=>await (await db()).getAll('inventory') as InventoryItem[]
export const saveInventoryItem=async(item:InventoryItem)=>{await (await db()).put('inventory',item)}
export const deleteInventoryItem=async(id:string)=>{await (await db()).delete('inventory',id)}
export const getSessions=async()=>await (await db()).getAll('sessions') as FishingSession[]
export const saveSession=async(session:FishingSession)=>{await (await db()).put('sessions',session)}
export const clearAll=async()=>{const d=await db();await Promise.all([d.clear('inventory'),d.clear('sessions')]);localStorage.clear()}
