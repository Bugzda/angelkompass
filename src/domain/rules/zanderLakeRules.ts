import type { Conditions, LureType, SpotFeature } from '../models/types'
import type { ScoringContext, ScoringRule } from './perchLakeRules'

const spot=(x:ScoringContext,...ids:SpotFeature[])=>ids.includes(x.candidateId as SpotFeature)
const setup=(x:ScoringContext,...ids:LureType['id'][])=>ids.includes(x.candidateId as LureType['id'])
// An explicit light observation takes precedence over the time-of-day proxy.
const lowLight=(c:Conditions)=>c.light==='dark'||(c.light==='unknown'&&['dawn','dusk','night'].includes(c.timeOfDay))
const sign=(c:Conditions,value:'baitfish'|'zanderContact')=>c.activity.status==='observed'&&c.activity.signs.includes(value)

export const zanderSpotRules:ScoringRule[]=[
 {id:'ZOBS001',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'ZANDER_STRUCTURE',sourceIds:[],matches:x=>x.conditions.observedStructure.includes(x.candidateId as never)},
 {id:'ZOBS002',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'ZANDER_DEPTH',sourceIds:[],matches:x=>x.conditions.depth!=='unknown'&&((x.conditions.depth==='shallow'&&spot(x,'shallow','hardCover'))||(x.conditions.depth!=='shallow'&&spot(x,'dropoff','hardCover')))},
 {id:'ZLK001',target:'spot',group:'visibility',evidenceClass:'experience',confidence:.7,effect:2,reasonCode:'ZANDER_LOW_LIGHT',sourceIds:['Z01','Z04'],matches:x=>lowLight(x.conditions)&&spot(x,'shallow')&&x.conditions.depth==='shallow'},
 {id:'ZLK002',target:'spot',group:'visibility',evidenceClass:'experience',confidence:.72,effect:2,reasonCode:'ZANDER_BRIGHT_DEPTH',sourceIds:['Z01'],matches:x=>x.conditions.light==='bright'&&x.conditions.turbidity==='clear'&&spot(x,'dropoff')&&x.conditions.depth!=='shallow'},
 {id:'ZLK003',target:'spot',group:'thermalPhase',evidenceClass:'experience',confidence:.65,effect:1,reasonCode:'ZANDER_COLD_TRANSITION',sourceIds:['Z02'],matches:x=>(['cold','cool'].includes(x.conditions.waterTemperature)||(x.conditions.waterTemperature==='unknown'&&x.conditions.season==='winter'))&&spot(x,'dropoff')&&x.conditions.depth!=='shallow'},
 {id:'ZOBS003',target:'spot',group:'activityObservation',evidenceClass:'experience',confidence:.72,effect:2,reasonCode:'ZANDER_PREY',sourceIds:['Z01','Z02'],matches:x=>sign(x.conditions,'baitfish')&&spot(x,'openWater','dropoff')},
]

export const zanderSetupRules:ScoringRule[]=[
 {id:'ZLK011',target:'setup',group:'control',evidenceClass:'experience',confidence:.75,effect:3,reasonCode:'ZANDER_DEPTH_CONTROL',sourceIds:['Z03'],matches:x=>x.conditions.depth==='deep'&&setup(x,'jig','dropshot','carolina')},
 {id:'ZLK012',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.7,effect:2,reasonCode:'ZANDER_BOTTOM',sourceIds:['Z02','Z03'],matches:x=>['dropoff','hardCover'].includes(x.spotId??'')&&setup(x,'jig','carolina')},
 {id:'ZLK013',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.72,effect:3,reasonCode:'ZANDER_NIGHT_WOBBLER',sourceIds:['Z04'],matches:x=>lowLight(x.conditions)&&x.conditions.depth==='shallow'&&setup(x,'twitchbait')},
 {id:'ZLK014',target:'setup',group:'thermalPhase',evidenceClass:'weak',confidence:.55,effect:1,reasonCode:'ZANDER_SLOW',sourceIds:['Z03'],matches:x=>(['cold','cool'].includes(x.conditions.waterTemperature)||x.conditions.activity.status==='none')&&setup(x,'dropshot','carolina')},
 {id:'ZOBS011',target:'setup',group:'activityObservation',evidenceClass:'experience',confidence:.7,effect:2,reasonCode:'ZANDER_CONTACT',sourceIds:['Z02','Z03'],matches:x=>sign(x.conditions,'zanderContact')&&setup(x,'dropshot','jig')},
 {id:'ZLK015',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.72,effect:-3,reasonCode:'ZANDER_SNAGS',sourceIds:['Z03'],matches:x=>x.conditions.vegetation==='dense'&&setup(x,'dropshot','carolina','twitchbait')},
 {id:'ZLK016',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.72,effect:2,reasonCode:'ZANDER_OFFSET',sourceIds:['Z03'],matches:x=>x.conditions.vegetation==='dense'&&setup(x,'jig')},
]
export const zanderAllRules=[...zanderSpotRules,...zanderSetupRules]
