import type { Conditions, LureType, SpotFeature } from '../models/types'
import type { ScoringContext, ScoringRule } from './perchLakeRules'

const sign=(c:Conditions,value:string)=>c.activity.status==='observed'&&c.activity.signs.includes(value as never)
const spot=(x:ScoringContext,...ids:SpotFeature[])=>ids.includes(x.candidateId as SpotFeature)
const setup=(x:ScoringContext,...ids:LureType['id'][])=>ids.includes(x.candidateId as LureType['id'])

export const pikeSpotRules:ScoringRule[]=[
 {id:'POBS001',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'PIKE_OBSERVED_STRUCTURE',sourceIds:[],matches:x=>x.conditions.observedStructure.includes(x.candidateId as never)},
 {id:'PKL001',target:'spot',group:'habitatObservation',evidenceClass:'science',confidence:.9,effect:3,reasonCode:'PIKE_VEGETATION_EDGE',sourceIds:['P01','P02'],matches:x=>spot(x,'vegetation')&&x.conditions.vegetation==='edgeOrGaps'},
 {id:'PKL002',target:'spot',group:'habitatObservation',evidenceClass:'science',confidence:.82,effect:2,reasonCode:'PIKE_DENSE_COVER',sourceIds:['P01'],matches:x=>spot(x,'vegetation')&&x.conditions.vegetation==='dense'},
 {id:'POBS002',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'PIKE_DEPTH_MATCH',sourceIds:[],matches:x=>x.conditions.depth!=='unknown'&&((x.conditions.depth==='shallow'&&spot(x,'shallow','vegetation','hardCover'))||(x.conditions.depth==='medium'&&spot(x,'vegetation','hardCover','dropoff'))||(x.conditions.depth==='deep'&&spot(x,'dropoff')))},
 {id:'PKL003',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.78,effect:2,reasonCode:'PIKE_SPRING_SHALLOW',sourceIds:['P01'],matches:x=>spot(x,'shallow','vegetation')&&x.conditions.waterTemperature==='unknown'&&x.conditions.season==='spring'},
 {id:'PKL004',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.8,effect:2,reasonCode:'PIKE_COLD_TRANSITION',sourceIds:['P03'],matches:x=>spot(x,'dropoff','hardCover')&&['cold','cool'].includes(x.conditions.waterTemperature)},
 {id:'PKL005',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.75,effect:-2,reasonCode:'PIKE_HOT_SHALLOW_CAUTION',sourceIds:['P04'],matches:x=>spot(x,'shallow')&&x.conditions.waterTemperature==='hot'},
 {id:'POBS003',target:'spot',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'PIKE_BAITFISH_COVER',sourceIds:[],matches:x=>sign(x.conditions,'baitfish')&&spot(x,'vegetation','hardCover','shallow')},
 {id:'POBS004',target:'spot',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'PIKE_CONTACT_ZONE',sourceIds:[],matches:x=>sign(x.conditions,'pikeContact')},
]

export const pikeSetupRules:ScoringRule[]=[
 {id:'PKL011',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.82,effect:3,reasonCode:'PIKE_EDGE_CONTROL',sourceIds:['P05'],matches:x=>x.spotId==='vegetation'&&x.conditions.vegetation==='edgeOrGaps'&&setup(x,'spinnerbait','swimbait','jerkbait')},
 {id:'PKL012',target:'setup',group:'presentation',evidenceClass:'observation',confidence:.9,effect:-2,reasonCode:'PIKE_DENSE_SNAG_RISK',sourceIds:[],matches:x=>x.conditions.vegetation==='dense'&&setup(x,'crankbait','spinner')},
 {id:'PKL013',target:'setup',group:'control',evidenceClass:'experience',confidence:.82,effect:3,reasonCode:'PIKE_DEEP_CONTROL',sourceIds:['P05'],matches:x=>x.conditions.depth==='deep'&&setup(x,'jig','spoon','swimbait')},
 {id:'PKL014',target:'setup',group:'thermalPhase',evidenceClass:'experience',confidence:.76,effect:2,reasonCode:'PIKE_COLD_PAUSE',sourceIds:['P03'],matches:x=>['cold','cool'].includes(x.conditions.waterTemperature)&&setup(x,'jerkbait','jig','swimbait')},
 {id:'PKL015',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.68,effect:2,reasonCode:'PIKE_TURBID_VIBRATION',sourceIds:['P05'],matches:x=>x.conditions.turbidity==='turbid'&&setup(x,'spinnerbait','spinner','crankbait','spoon')},
 {id:'PKL016',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.72,effect:1,reasonCode:'PIKE_CLEAR_NATURAL',sourceIds:['P05'],matches:x=>x.conditions.turbidity==='clear'&&setup(x,'swimbait','jerkbait','jig')},
 {id:'POBS011',target:'setup',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'PIKE_ACTIVE_SEARCH',sourceIds:[],matches:x=>(sign(x.conditions,'pikeContact')||sign(x.conditions,'surfaceActivity'))&&setup(x,'jerkbait','crankbait','spinnerbait','spoon','spinner','swimbait')},
 {id:'POBS012',target:'setup',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'PIKE_PREY_PROFILE',sourceIds:[],matches:x=>sign(x.conditions,'baitfish')&&setup(x,'jig','jerkbait','crankbait','swimbait')},
 {id:'PKL017',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:3,reasonCode:'PIKE_HARD_COVER',sourceIds:['P05'],matches:x=>x.spotId==='hardCover'&&setup(x,'spinnerbait','jerkbait','jig')},
 {id:'PKL018',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:3,reasonCode:'PIKE_SHALLOW_SEARCH',sourceIds:['P05'],matches:x=>x.spotId==='shallow'&&setup(x,'jerkbait','spinnerbait','spinner','popper')},
 {id:'PKL019',target:'setup',group:'thermalPhase',evidenceClass:'experience',confidence:.78,effect:-2,reasonCode:'PIKE_TOPWATER_WINDOW',sourceIds:['P05'],matches:x=>setup(x,'popper')&&!((x.conditions.waterTemperature==='warm'||x.conditions.season==='summer')&&x.conditions.depth==='shallow')},
 {id:'PKL020',target:'setup',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'PIKE_TOPWATER_ACTIVITY',sourceIds:[],matches:x=>setup(x,'popper')&&x.conditions.depth==='shallow'&&sign(x.conditions,'surfaceActivity')},
]
export const pikeAllRules=[...pikeSpotRules,...pikeSetupRules]

export const pikeResearchSources={
 P01:{citation:'Nilsson et al. (2023), reed beds and submerged vegetation',url:'https://doi.org/10.1016/j.fishres.2023.106625'},
 P02:{citation:'Skov et al. (2023), habitat-specific pike growth and food',url:'https://doi.org/10.1016/j.fishres.2022.106563'},
 P03:{citation:'Öhlund et al. (2015), temperature dependence of predation',url:'https://pubmed.ncbi.nlm.nih.gov/25473013/'},
 P04:{citation:'Warm-water caution; conservative welfare inference',url:'https://pubmed.ncbi.nlm.nih.gov/41840780/'},
 P05:{citation:'Angling presentation knowledge; experience class',url:'https://www.fao.org/fishery/en/fishspec/2942'},
} as const
