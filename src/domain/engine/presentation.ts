import type { Conditions, GuidanceMode, LureType, NumericRange, RankedSpot, ResolvedPresentation, SizeClass, WeightClass } from '../models/types'

const rangeLabel=(range:NumericRange|undefined,unit:string)=>{
  if(!range)return undefined
  return range.max===undefined?`ab ${range.min} ${unit}`:`${range.min}–${range.max} ${unit}`
}

export function sizeLabelFor(lure:LureType,size:SizeClass){
  return rangeLabel(lure.sizeRangesCm?.[size],'cm')??({small:'3–5 cm',medium:'5–8 cm',large:'8–12 cm'} as const)[size]
}

function selectProfile(conditions:Conditions,lure:LureType,spot:RankedSpot){
  const profiles=lure.presentations??[]
  if(lure.id==='jig'&&conditions.targetFish==='perch'){
    if(['edgeOrGaps','dense'].includes(conditions.vegetation))return profiles.find(item=>item.id==='texas-offset')??profiles[0]
    if(spot.spot.id==='dropoff'&&conditions.vegetation==='none')return profiles.find(item=>item.id==='carolina')??profiles[0]
  }
  if(lure.id==='jig'&&conditions.targetFish==='pike'){
    if(conditions.vegetation==='dense')return profiles.find(item=>item.id==='pike-weedless-offset')??profiles[0]
    if(conditions.depth==='shallow')return profiles.find(item=>item.id==='pike-shallow-screw')??profiles[0]
  }
  return profiles.find(item=>conditions.depth==='unknown'||item.depths.includes(conditions.depth))??profiles[0]
}

function guidanceMode(conditions:Conditions):GuidanceMode{
  if(['cold','cool'].includes(conditions.waterTemperature)||conditions.season==='winter'||conditions.activity.status==='none')return'slow'
  if(conditions.activity.status==='observed'&&['mild','warm'].includes(conditions.waterTemperature))return'active'
  return'controlled'
}

function resolvedWeightLabel(profile:NonNullable<LureType['presentations']>[number],conditions:Conditions,size:SizeClass){
  if(profile.weightKind==='none')return'Keine Zusatzbeschwerung · Ködergewicht nutzen'
  if(profile.weightKind==='lure-total'){
    const value=rangeLabel(profile.lureWeightBySize?.[size],'g')
    return value?`${value} Ködergesamtgewicht · keine Zusatzbeschwerung`:'Ködergesamtgewicht passend zur Größe · keine Zusatzbeschwerung'
  }
  const depth=conditions.depth==='unknown'?'shallow':conditions.depth
  const value=rangeLabel(profile.terminalWeightByDepth?.[depth],'g')
  return value?`${value} Beschwerung · mit der leichtesten kontrollierbaren Stufe beginnen`:'Leichteste kontrollierbare Beschwerung verwenden; keine pauschale Grammzahl'
}

function legacyWeightClass(profile:NonNullable<LureType['presentations']>[number],conditions:Conditions,size:SizeClass):WeightClass{
  if(profile.weightKind==='none')return'ultralight'
  if(profile.weightKind==='lure-total')return size==='small'?'light':size==='medium'?'medium':'heavy'
  const depth=conditions.depth==='unknown'?'shallow':conditions.depth
  const max=profile.terminalWeightByDepth?.[depth]?.max??profile.terminalWeightByDepth?.[depth]?.min
  return max===undefined?'medium':max<=4?'ultralight':max<=8?'light':max<=15?'medium':'heavy'
}

export function resolvePresentation(conditions:Conditions,lure:LureType,spot:RankedSpot,size:SizeClass):{presentation:ResolvedPresentation;weight:WeightClass}{
  const profile=selectProfile(conditions,lure,spot)
  const mode=guidanceMode(conditions)
  if(!profile){
    return{presentation:{profileId:'legacy',profileLabel:'Standardmontage',mounting:lure.mounting,sizeLabel:sizeLabelFor(lure,size),weightLabel:'Beschwerung passend zum Zielhorizont',weightKind:'terminal',guidance:lure.guidance,mode},weight:conditions.depth==='deep'?'heavy':conditions.depth==='shallow'?'light':'medium'}
  }
  let guidance=profile.guidance[mode]
  if(conditions.depth==='deep')guidance+=` Sinkzeit messen und den ${profile.style==='bottom'?'Grundkontakt':'Zielhorizont'} reproduzierbar halten.`
  return{presentation:{profileId:profile.id,profileLabel:profile.label,mounting:profile.mounting,sizeLabel:sizeLabelFor(lure,size),weightLabel:resolvedWeightLabel(profile,conditions,size),weightKind:profile.weightKind,guidance,mode},weight:legacyWeightClass(profile,conditions,size)}
}

export function presentationForDisplay(setup:{lure:LureType;size:SizeClass;weight:WeightClass;resolvedPresentation?:ResolvedPresentation}){
  return setup.resolvedPresentation??{profileId:'legacy',profileLabel:'Standardmontage',mounting:setup.lure.mounting,sizeLabel:sizeLabelFor(setup.lure,setup.size),weightLabel:({ultralight:'Ultraleicht',light:'Leicht',medium:'Mittel',heavy:'Schwer'} as const)[setup.weight],weightKind:'terminal' as const,guidance:setup.lure.guidance,mode:'controlled' as const}
}
