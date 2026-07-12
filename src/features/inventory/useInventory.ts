import { useEffect, useState } from 'react'
import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import type { InventoryItem, LureType, SizeClass, TargetFish } from '../../domain/models/types'

const STORAGE_KEY='angelkompass.inventory.v3'
const V2_KEY='angelkompass.inventory.v2'
const V1_KEY='angelkompass.inventory.v1'
const sizes:SizeClass[]=['small','medium','large']
const catalogs:Record<TargetFish,LureType[]>={perch:lures,pike:pikeLures}

const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null
const isFish=(value:unknown):value is TargetFish=>value==='perch'||value==='pike'
const isSize=(value:unknown):value is SizeClass=>value==='small'||value==='medium'||value==='large'
const lureFor=(fish:TargetFish,id:unknown)=>catalogs[fish].find(lure=>lure.id===id)
const supportedSizes=(fish:TargetFish,id:LureType['id'])=>lureFor(fish,id)?.sizes??[]

function mergeItems(items:InventoryItem[]){
  const merged=new Map<string,InventoryItem>()
  for(const item of items){
    if(!item.targetFish)continue
    const supported=supportedSizes(item.targetFish,item.lureTypeId)
    const valid=(item.sizes??[]).filter(size=>supported.includes(size))
    if(!valid.length)continue
    const key=`${item.targetFish}:${item.lureTypeId}`
    const previous=merged.get(key)
    merged.set(key,{targetFish:item.targetFish,lureTypeId:item.lureTypeId,sizes:[...new Set([...(previous?.sizes??[]),...valid])],migratedNeedsReview:Boolean(previous?.migratedNeedsReview||item.migratedNeedsReview)})
  }
  return[...merged.values()]
}

function parseV3(raw:string):InventoryItem[]{
  const value:unknown=JSON.parse(raw)
  if(!isRecord(value)||value.schemaVersion!==3||!Array.isArray(value.items))return[]
  const parsed:InventoryItem[]=[]
  for(const item of value.items){
    if(!isRecord(item)||!isFish(item.targetFish)||typeof item.lureTypeId!=='string'||!Array.isArray(item.sizes))continue
    const lure=lureFor(item.targetFish,item.lureTypeId)
    if(!lure)continue
    parsed.push({targetFish:item.targetFish,lureTypeId:lure.id,sizes:item.sizes.filter(isSize),migratedNeedsReview:item.migratedNeedsReview===true})
  }
  return mergeItems(parsed)
}

function migrateV2(raw:string):InventoryItem[]{
  const value:unknown=JSON.parse(raw)
  if(!isRecord(value)||value.schemaVersion!==2||!Array.isArray(value.items))return[]
  const migrated:InventoryItem[]=[]
  for(const item of value.items){
    if(!isRecord(item)||typeof item.lureTypeId!=='string')continue
    const oldSizes=Array.isArray(item.sizes)?item.sizes.filter(isSize):[]
    const perch=lureFor('perch',item.lureTypeId)
    if(perch){
      const selected=oldSizes.length?oldSizes.filter(size=>perch.sizes.includes(size)):[...perch.sizes]
      if(selected.length)migrated.push({targetFish:'perch',lureTypeId:perch.id,sizes:selected,migratedNeedsReview:true})
    }
    const pike=lureFor('pike',item.lureTypeId)
    if(pike&&oldSizes.some(size=>size==='medium'||size==='large')){
      const selected=oldSizes.filter(size=>(size==='medium'||size==='large')&&pike.sizes.includes(size))
      if(selected.length)migrated.push({targetFish:'pike',lureTypeId:pike.id,sizes:selected,migratedNeedsReview:true})
    }
  }
  return mergeItems(migrated)
}

function migrateV1(raw:string):InventoryItem[]{
  const value:unknown=JSON.parse(raw)
  if(!Array.isArray(value))return[]
  return mergeItems(value.flatMap(item=>{
    if(!isRecord(item)||typeof item.lureTypeId!=='string')return[]
    const lure=lureFor('perch',item.lureTypeId)
    return lure?[{targetFish:'perch' as const,lureTypeId:lure.id,sizes:[...lure.sizes],migratedNeedsReview:true}]:[]
  }))
}

export function readInventory():InventoryItem[]{
  try{
    const v3=localStorage.getItem(STORAGE_KEY)
    if(v3!==null)return parseV3(v3)
    const v2=localStorage.getItem(V2_KEY)
    if(v2!==null)return migrateV2(v2)
    return migrateV1(localStorage.getItem(V1_KEY)??'[]')
  }catch{return[]}
}

export function useInventory(){
  const[inventory,setInventory]=useState<InventoryItem[]>(readInventory)
  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:3,items:inventory})),[inventory])
  const toggleSize=(targetFish:TargetFish,lureTypeId:LureType['id'],size:SizeClass)=>setInventory(current=>{
    const supported=supportedSizes(targetFish,lureTypeId)
    if(!supported.includes(size))return current
    const found=current.find(item=>item.targetFish===targetFish&&item.lureTypeId===lureTypeId)
    if(!found)return[...current,{targetFish,lureTypeId,sizes:[size],migratedNeedsReview:false}]
    const next=found.sizes?.includes(size)?found.sizes.filter(item=>item!==size):[...(found.sizes??[]),size]
    return current.map(item=>item===found?{...item,sizes:next,migratedNeedsReview:false}:item).filter(item=>item!==found||next.length>0)
  })
  const toggleAllSizes=(targetFish:TargetFish,lureTypeId:LureType['id'])=>setInventory(current=>{
    const all=supportedSizes(targetFish,lureTypeId)
    const found=current.find(item=>item.targetFish===targetFish&&item.lureTypeId===lureTypeId)
    const hasAll=Boolean(found)&&all.every(size=>found?.sizes?.includes(size))
    if(hasAll)return current.filter(item=>item!==found)
    if(!found)return[...current,{targetFish,lureTypeId,sizes:[...all],migratedNeedsReview:false}]
    return current.map(item=>item===found?{...item,sizes:[...all],migratedNeedsReview:false}:item)
  })
  return{inventory,toggleSize,toggleAllSizes}
}

export const inventoryStorageKeys={current:STORAGE_KEY,v2:V2_KEY,v1:V1_KEY} as const
