import type { Conditions, RankedSpot, ReasonContribution, SetupRecommendation, SpotType, LureType, Confidence, InventoryItem, InventoryMatch, AttemptStep, FishingSession, Recommendation } from '../models/types'
import { spots } from '../catalogs/spots'; import { lures } from '../catalogs/lures'; import { perchProfile } from '../catalogs/profile'; import { RULESET_VERSION } from '../models/types'
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const reason=(ruleId:string,reasonCode:string,scoreDelta:number,...evidence:string[]):ReasonContribution=>({ruleId,reasonCode,scoreDelta,evidence})

export function evaluateSpots(c:Conditions, catalog=spots):RankedSpot[]{
 return catalog.filter(s=>s.waters.includes(c.waterType)).map(spot=>{
  const r:ReasonContribution[]=[]
  if(c.observedStructure.includes(spot.feature)) r.push(reason('spot.observed','OBSERVED_STRUCTURE',20,spot.feature))
  if(spot.seasonalAffinity.includes(c.season)) r.push(reason('spot.season','SEASONAL_SPOT',8,c.season))
  if(c.depth!=='unknown' && ((c.depth==='shallow'&&spot.feature==='shallow')||(c.depth==='deep'&&['dropoff','vertical','harbor'].includes(spot.feature)))) r.push(reason('spot.depth','DEPTH_MATCH',12,c.depth))
  if(c.current!=='unknown'&&['medium','strong'].includes(c.current)&&['current_break','bridge','inflow'].includes(spot.feature)) r.push(reason('spot.current','CURRENT_SHELTER',15,c.current))
  if(c.timeOfDay!=='unknown'&&['dawn','dusk'].includes(c.timeOfDay)&&['shallow','vegetation','inflow'].includes(spot.feature)) r.push(reason('spot.feeding-time','FEEDING_WINDOW',8,c.timeOfDay))
  if(c.light==='bright'&&['wood','bridge','vertical'].includes(spot.feature)) r.push(reason('spot.shadow','SHADE_IN_BRIGHT_LIGHT',10))
  return {spot,score:clamp(50+r.reduce((n,x)=>n+x.scoreDelta,0)),reasons:r}
 }).sort((a,b)=>b.score-a.score||a.spot.priority-b.spot.priority||a.spot.id.localeCompare(b.spot.id))
}
const chooseColor=(c:Conditions)=>c.turbidity==='turbid'?'contrast':c.turbidity==='clear'?(c.light==='bright'?'transparent':'natural'):(c.timeOfDay==='night'?'contrast':'natural') as SetupRecommendation['color']
const chooseSize=(c:Conditions):SetupRecommendation['size']=>c.waterTemperature==='cold'||c.fishingPressure==='high'?'small':c.activitySigns?.includes('baitfish')?'medium':'medium'
const chooseWeight=(c:Conditions):SetupRecommendation['weight']=>c.current==='strong'||c.depth==='deep'?'heavy':c.current==='medium'||c.depth==='medium'?'medium':c.depth==='shallow'?'light':'medium'
export function evaluateSetups(c:Conditions,_spot:RankedSpot,catalog=lures):SetupRecommendation[]{
 return catalog.filter(l=>c.depth==='unknown'||l.depths.includes(c.depth)).filter(l=>c.current==='unknown'||l.currents.includes(c.current)).map(lure=>{
  const r:ReasonContribution[]=[]
  if(c.turbidity==='turbid'&&['spinner','chatterbait','crankbait'].includes(lure.id)) r.push(reason('lure.vibration','TURBID_WATER_VIBRATION',15))
  if(c.turbidity==='clear'&&['ned','drop-shot','twitchbait'].includes(lure.id)) r.push(reason('lure.subtle','CLEAR_WATER_SUBTLE',14))
  if(c.waterTemperature==='cold'&&['drop-shot','ned','blade-bait'].includes(lure.id)) r.push(reason('lure.cold','COLD_WATER_SLOW',16))
  if(c.fishingPressure==='high'&&['ned','drop-shot','free','wacky'].includes(lure.id)) r.push(reason('lure.pressure','PRESSURE_FINESSE',14))
  if(c.activitySigns?.some(x=>['baitfish','hunting'].includes(x))&&['twitchbait','spinner','chatterbait','crankbait'].includes(lure.id)) r.push(reason('lure.active','ACTIVE_FISH_SEARCH_BAIT',14))
  if(c.observedStructure.some(x=>['vegetation','wood'].includes(x))&&['texas','jika','free'].includes(lure.id)) r.push(reason('lure.cover','COVER_WEEDLESS',15))
  if(c.depth==='deep'&&['jig','drop-shot','blade-bait'].includes(lure.id)) r.push(reason('lure.deep','DEEP_WATER_CONTROL',12))
  if(c.current==='strong'&&['jig','cheburashka','blade-bait'].includes(lure.id)) r.push(reason('lure.current','CURRENT_CONTROL',12))
  const color=chooseColor(c),size=chooseSize(c),weight=chooseWeight(c)
  if(color==='contrast') r.push(reason('color.contrast','TURBID_WATER_NEEDS_CONTRAST',12,c.turbidity))
  return {lure,score:clamp(50+r.reduce((n,x)=>n+x.scoreDelta,0)),size:lure.sizes.includes(size)?size:lure.sizes[0],color:lure.colors.includes(color)?color:lure.colors[0],weight:lure.weights.includes(weight)?weight:lure.weights[lure.weights.length-1],mounting:lure.mounting,guidance:lure.guidance[0],reasons:r}
 }).sort((a,b)=>b.score-a.score||a.lure.priority-b.lure.priority||a.lure.id.localeCompare(b.lure.id))
}
export function calculateConfidence(c:Conditions,scores:number[]):Confidence { const known=[c.timeOfDay,c.turbidity,c.current,c.depth].filter(x=>x!=='unknown').length+(c.observedStructure.length?1:0)+(c.light?1:0)+(c.waterTemperature?1:0)+(c.fishingPressure&&c.fishingPressure!=='unknown'?1:0); const coverage=known/8; const gap=(scores[0]??0)-(scores[1]??0); return coverage>=.8&&gap>=8?'high':coverage>=.5?'medium':'low' }
export function applyInventoryPreference(setups:SetupRecommendation[],inventory:InventoryItem[]):InventoryMatch|undefined { const active=inventory.filter(i=>i.enabled&&i.quantityState!=='empty'); const top=setups[0]; const exact=active.find(i=>i.lureTypeId===top.lure.id); if(exact)return {item:exact,kind:'exact',explanation:'Dieser passende Köder ist in deiner Köderbox.'}; for(const replacementId of top.lure.replacementIds){const item=active.find(i=>i.lureTypeId===replacementId);if(item)return {item,kind:'replacement',explanation:'Verfügbarer Ersatz mit ähnlicher Präsentation.'}} return undefined }
export function buildAttemptPlan(spot:RankedSpot,setups:SetupRecommendation[]):AttemptStep[]{ const selected=[setups[0],setups[1]??setups[0],setups.find(s=>['spinner','chatterbait','crankbait','twitchbait'].includes(s.lure.id))??setups[2]??setups[0]]; return selected.map((setup,i)=>({index:i+1,title:['Beste Übereinstimmung','Tiefe und Präsentation variieren','Aktiv nach Fischen suchen'][i],spotLabel:spot.spot.label,setup,limit:['12 Würfe oder 8 Minuten','10–15 Würfe ohne Kontakt','15 Würfe, dann Spot wechseln'][i],change:['Starte kontrolliert und beobachte Kontakte.','Ändere zunächst Tempo und Tiefe.','Nutze mehr Reiz und suche mehr Wasser ab.'][i],status:i===0?'active':'pending'})) }
export function createRecommendation(c:Conditions,inventory:InventoryItem[]=[]):Recommendation { const rankedSpots=evaluateSpots(c); const rankedSetups=evaluateSetups(c,rankedSpots[0]); const primary=rankedSetups[0]; return {id:`${rankedSpots[0].spot.id}-${primary.lure.id}`,spot:rankedSpots[0],primarySetup:primary,inventoryMatch:applyInventoryPreference(rankedSetups,inventory),reasonCodes:[...rankedSpots[0].reasons,...primary.reasons].map(r=>r.reasonCode),confidence:calculateConfidence(c,[rankedSpots[0].score,rankedSpots[1]?.score??0]),alternatives:rankedSetups.slice(1,4),attemptPlan:buildAttemptPlan(rankedSpots[0],rankedSetups)} }
export function createSession(c:Conditions,inventory:InventoryItem[]=[]):FishingSession { const recommendation=createRecommendation(c,inventory); return {id:crypto.randomUUID(),rulesetVersion:RULESET_VERSION,conditions:c,recommendations:[recommendation],feedback:[],createdAt:new Date().toISOString()} }
export const fishProfile=perchProfile
