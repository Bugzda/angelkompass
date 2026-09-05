import type { SpotType } from '../models/types'

export const zanderSpots:SpotType[]=[
  {id:'dropoff',label:'Tiefenkante oder Plateau',description:'Erreichbarer Tiefenübergang; sowohl grundnah als auch darüber nach Beutefisch suchen.',seasonalAffinity:['spring','summer','autumn','winter'],depthAffinity:['medium','deep'],priority:1},
  {id:'hardCover',label:'Steinpackung oder harter Grund',description:'Bestätigte Steine oder feste Grundübergänge mit kontrollierbarer Köderbahn.',seasonalAffinity:['spring','summer','autumn','winter'],depthAffinity:['shallow','medium','deep'],priority:2},
  {id:'shallow',label:'Flache Uferzone',description:'Erreichbare flache Zone; bei wenig Licht und Beutefisch als Suchbereich prüfen.',seasonalAffinity:['spring','summer','autumn'],depthAffinity:['shallow'],priority:3},
  {id:'openWater',label:'Freier Wasserbereich',description:'Den erreichbaren Horizont nach Beutefisch absuchen; Zander stehen nicht zwingend am Grund.',seasonalAffinity:['spring','summer','autumn','winter'],depthAffinity:['shallow','medium','deep'],priority:4},
]
