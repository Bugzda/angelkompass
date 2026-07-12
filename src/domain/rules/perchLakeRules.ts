import type { Conditions, EvidenceClass, LureType, RuleGroup, SpotFeature } from '../models/types'
import { sourceSubset } from '../research/productSources'

export interface ScoringContext { conditions: Conditions; candidateId: SpotFeature | LureType['id']; spotId?: SpotFeature }
export interface ScoringRule {
  id: string
  sourceRuleId?: string
  target: 'spot' | 'setup'
  group: RuleGroup
  evidenceClass: EvidenceClass
  confidence: number
  effect: -3 | -2 | -1 | 0 | 1 | 2 | 3
  reasonCode: string
  sourceIds: string[]
  matches: (context: ScoringContext) => boolean
}

const sign = (c: Conditions, value: string) => c.activity.status === 'observed' && c.activity.signs.includes(value as never)
const spot = (candidate: ScoringContext, ...ids: SpotFeature[]) => ids.includes(candidate.candidateId as SpotFeature)
const setup = (candidate: ScoringContext, ...ids: LureType['id'][]) => ids.includes(candidate.candidateId as LureType['id'])

export const groupCaps: Record<RuleGroup, { min: number; max: number }> = {
  thermalPhase: { min: -12, max: 12 }, visibility: { min: -12, max: 12 }, habitatObservation: { min: -12, max: 20 },
  activityObservation: { min: -12, max: 20 }, presentation: { min: -12, max: 12 }, control: { min: -12, max: 12 },
}

export const spotRules: ScoringRule[] = [
  { id:'OBS001',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'OBSERVED_STRUCTURE',sourceIds:[],matches:x=>x.conditions.observedStructure.includes(x.candidateId as never) },
  { id:'PL011',sourceRuleId:'R013',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'VEGETATION_EDGE_OBSERVED',sourceIds:['S06'],matches:x=>spot(x,'vegetation')&&x.conditions.vegetation==='edgeOrGaps' },
  { id:'PL012',sourceRuleId:'R014',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'DENSE_VEGETATION_HABITAT',sourceIds:['S06'],matches:x=>spot(x,'vegetation')&&x.conditions.vegetation==='dense' },
  { id:'OBS002',target:'spot',group:'habitatObservation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'DEPTH_MATCH',sourceIds:[],matches:x=>x.conditions.depth!=='unknown'&&((x.conditions.depth==='shallow'&&spot(x,'shallow','vegetation'))||(x.conditions.depth==='medium'&&spot(x,'vegetation','dropoff'))||(x.conditions.depth==='deep'&&spot(x,'dropoff'))) },
  { id:'PL013',sourceRuleId:'R005',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.9,effect:3,reasonCode:'COLD_DROPOFF',sourceIds:['S04'],matches:x=>spot(x,'dropoff')&&x.conditions.waterTemperature==='cold' },
  { id:'PL014',sourceRuleId:'R005',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.9,effect:-2,reasonCode:'COLD_SHALLOW_PENALTY',sourceIds:['S04'],matches:x=>spot(x,'shallow')&&x.conditions.waterTemperature==='cold' },
  { id:'PL015',sourceRuleId:'R001',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.88,effect:2,reasonCode:'COOL_DROPOFF',sourceIds:['S01'],matches:x=>spot(x,'dropoff')&&x.conditions.waterTemperature==='cool'&&!['edgeOrGaps','dense'].includes(x.conditions.vegetation) },
  { id:'PL016',sourceRuleId:'R002',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.86,effect:3,reasonCode:'MILD_VEGETATION',sourceIds:['S02'],matches:x=>spot(x,'vegetation')&&x.conditions.waterTemperature==='mild' },
  { id:'PL017',sourceRuleId:'R003',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.78,effect:2,reasonCode:'WARM_LITTORAL',sourceIds:['S01'],matches:x=>spot(x,'vegetation','shallow')&&x.conditions.waterTemperature==='warm' },
  { id:'PL018',sourceRuleId:'R024',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.82,effect:-2,reasonCode:'HOT_SHALLOW_CAUTION',sourceIds:['S24'],matches:x=>spot(x,'shallow')&&x.conditions.waterTemperature==='hot' },
  { id:'PL018B',sourceRuleId:'R024',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.82,effect:-1,reasonCode:'HOT_GENERAL_CAUTION',sourceIds:['S24'],matches:x=>x.conditions.waterTemperature==='hot' },
  { id:'PL019',sourceRuleId:'R002',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.86,effect:3,reasonCode:'SEASONAL_VEGETATION',sourceIds:['S02'],matches:x=>spot(x,'vegetation')&&x.conditions.waterTemperature==='unknown'&&['spring','summer'].includes(x.conditions.season) },
  { id:'PL020',sourceRuleId:'R004',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.88,effect:3,reasonCode:'AUTUMN_DROPOFF',sourceIds:['S11'],matches:x=>spot(x,'dropoff')&&x.conditions.waterTemperature==='unknown'&&x.conditions.season==='autumn' },
  { id:'PL021',sourceRuleId:'R005',target:'spot',group:'thermalPhase',evidenceClass:'science',confidence:.9,effect:3,reasonCode:'WINTER_DROPOFF',sourceIds:['S04'],matches:x=>spot(x,'dropoff')&&x.conditions.waterTemperature==='unknown'&&x.conditions.season==='winter' },
  { id:'PL022',sourceRuleId:'R007',target:'spot',group:'visibility',evidenceClass:'science',confidence:.9,effect:3,reasonCode:'TWILIGHT_SHALLOW',sourceIds:['S04'],matches:x=>spot(x,'shallow')&&x.conditions.season!=='summer'&&['dawn','dusk'].includes(x.conditions.timeOfDay)&&x.conditions.turbidity!=='turbid' },
  { id:'PL023',sourceRuleId:'R009',target:'spot',group:'visibility',evidenceClass:'science',confidence:.7,effect:2,reasonCode:'CLEAR_BRIGHT_DEPTH',sourceIds:['S07'],matches:x=>spot(x,'dropoff')&&x.conditions.turbidity==='clear'&&x.conditions.light==='bright' },
  { id:'PL024',sourceRuleId:'R043',target:'spot',group:'visibility',evidenceClass:'weak',confidence:.6,effect:1,reasonCode:'DIFFUSE_SHALLOW_NEUTRAL',sourceIds:['S05'],matches:x=>spot(x,'shallow')&&x.conditions.light==='diffuse' },
  { id:'OBS003',sourceRuleId:'R026',target:'spot',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'BAITFISH_NEAR_COVER',sourceIds:['S20'],matches:x=>spot(x,'vegetation','shallow')&&sign(x.conditions,'baitfish') },
  { id:'OBS004',sourceRuleId:'R053',target:'spot',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'HUNTING_FISH_SHALLOW',sourceIds:['S11'],matches:x=>spot(x,'shallow')&&(sign(x.conditions,'huntingPerch')||sign(x.conditions,'surfaceActivity')) },
]

export const setupRules: ScoringRule[] = [
  { id:'PL031',sourceRuleId:'R033',target:'setup',group:'thermalPhase',evidenceClass:'experience',confidence:.82,effect:2,reasonCode:'COLD_FINESSE',sourceIds:['S15','S16'],matches:x=>['cold','cool'].includes(x.conditions.waterTemperature)&&setup(x,'ned','drop-shot') },
  { id:'PL032',sourceRuleId:'R033',target:'setup',group:'thermalPhase',evidenceClass:'experience',confidence:.82,effect:2,reasonCode:'WINTER_FINESSE',sourceIds:['S15','S16'],matches:x=>x.conditions.waterTemperature==='unknown'&&x.conditions.season==='winter'&&setup(x,'ned','drop-shot') },
  { id:'PL033',sourceRuleId:'R024',target:'setup',group:'thermalPhase',evidenceClass:'science',confidence:.82,effect:-2,reasonCode:'HOT_SEARCH_PENALTY',sourceIds:['S24'],matches:x=>x.conditions.waterTemperature==='hot'&&setup(x,'twitchbait','spinner','crankbait','chatterbait','blade-bait','spinnerbait','popper','tail-spinner') },
  { id:'PL034',sourceRuleId:'R011',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.68,effect:2,reasonCode:'TURBID_SEARCH',sourceIds:['S16'],matches:x=>x.conditions.turbidity==='turbid'&&setup(x,'twitchbait','spinner','crankbait','chatterbait','spinnerbait','tail-spinner') },
  { id:'PL035',sourceRuleId:'R036',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.72,effect:1,reasonCode:'CLEAR_NATURAL',sourceIds:['S16'],matches:x=>x.conditions.turbidity==='clear'&&setup(x,'ned','drop-shot') },
  { id:'PL036',sourceRuleId:'R037',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.7,effect:1,reasonCode:'DARK_CONTROL',sourceIds:['S10'],matches:x=>x.conditions.light==='dark'&&setup(x,'jig','ned','drop-shot') },
  { id:'OBS011',sourceRuleId:'R032',target:'setup',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'ACTIVE_SEARCH',sourceIds:['S16'],matches:x=>(sign(x.conditions,'huntingPerch')||sign(x.conditions,'surfaceActivity'))&&setup(x,'twitchbait','spinner','crankbait','chatterbait','blade-bait','spinnerbait','tail-spinner') },
  { id:'OBS012',sourceRuleId:'R026',target:'setup',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'BAITFISH_PROFILE',sourceIds:['S20'],matches:x=>sign(x.conditions,'baitfish')&&setup(x,'jig','twitchbait','spinner','crankbait','chatterbait','blade-bait','spinnerbait','tail-spinner') },
  { id:'PL037',sourceRuleId:'R013',target:'setup',group:'presentation',evidenceClass:'science',confidence:.86,effect:2,reasonCode:'VEGETATION_EDGE_SEARCH',sourceIds:['S06'],matches:x=>x.conditions.vegetation==='edgeOrGaps'&&x.spotId==='vegetation'&&setup(x,'twitchbait','spinner','crankbait','chatterbait','spinnerbait') },
  { id:'OBS013',sourceRuleId:'R014',target:'setup',group:'presentation',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'DENSE_EDGE_FINESSE',sourceIds:['S06'],matches:x=>x.conditions.vegetation==='dense'&&x.spotId==='vegetation'&&setup(x,'ned','drop-shot') },
  { id:'OBS014',sourceRuleId:'R014',target:'setup',group:'presentation',evidenceClass:'observation',confidence:.95,effect:-1,reasonCode:'DENSE_CORE_SNAG_RISK',sourceIds:['S06'],matches:x=>x.conditions.vegetation==='dense'&&x.spotId==='vegetation'&&setup(x,'twitchbait','spinner','spinnerbait') },
  { id:'OBS016',sourceRuleId:'R014',target:'setup',group:'presentation',evidenceClass:'observation',confidence:.95,effect:-2,reasonCode:'DENSE_MOVING_BAIT_RISK',sourceIds:['S06'],matches:x=>x.conditions.vegetation==='dense'&&x.spotId==='vegetation'&&setup(x,'crankbait','chatterbait','tail-spinner') },
  { id:'FIT001',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:3,reasonCode:'DROPOFF_CONTROL',sourceIds:[],matches:x=>x.spotId==='dropoff'&&setup(x,'jig','drop-shot') },
  { id:'FIT002',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:3,reasonCode:'SHALLOW_SEARCH',sourceIds:[],matches:x=>x.spotId==='shallow'&&setup(x,'twitchbait','spinner','crankbait','chatterbait','spinnerbait','tail-spinner') },
  { id:'OBS015',sourceRuleId:'R038',target:'setup',group:'control',evidenceClass:'observation',confidence:.95,effect:2,reasonCode:'DEEP_CONTROL',sourceIds:['S15','S16'],matches:x=>x.conditions.depth==='deep'&&(setup(x,'jig','drop-shot')||((x.conditions.waterTemperature!=='cold'||x.conditions.activity.status==='observed')&&setup(x,'blade-bait','tail-spinner'))) },
  { id:'PL040',sourceRuleId:'R004',target:'setup',group:'thermalPhase',evidenceClass:'science',confidence:.88,effect:2,reasonCode:'AUTUMN_CRANK_SEARCH',sourceIds:['S01','S02','S11'],matches:x=>x.spotId==='dropoff'&&x.conditions.season==='autumn'&&setup(x,'crankbait') },
  { id:'PL041',sourceRuleId:'R007',target:'setup',group:'visibility',evidenceClass:'science',confidence:.9,effect:2,reasonCode:'TWILIGHT_CRANK',sourceIds:['S03','S04','S05'],matches:x=>x.conditions.season!=='summer'&&['dawn','dusk'].includes(x.conditions.timeOfDay)&&setup(x,'crankbait') },
  { id:'PL042',sourceRuleId:'R034',target:'setup',group:'thermalPhase',evidenceClass:'experience',confidence:.84,effect:2,reasonCode:'WARM_CHATTER_SEARCH',sourceIds:['S16'],matches:x=>x.conditions.waterTemperature==='warm'&&setup(x,'chatterbait') },
  { id:'PL043',sourceRuleId:'R004',target:'setup',group:'control',evidenceClass:'science',confidence:.88,effect:2,reasonCode:'AUTUMN_BLADE_DEPTH',sourceIds:['S01','S02','S11'],matches:x=>x.spotId==='dropoff'&&['autumn'].includes(x.conditions.season)&&setup(x,'blade-bait','tail-spinner') },
  { id:'PL044',sourceRuleId:'R005',target:'setup',group:'control',evidenceClass:'experience',confidence:.75,effect:1,reasonCode:'COLD_BLADE_CONTROLLED',sourceIds:['S01','S02','S04','S18'],matches:x=>['cold','cool'].includes(x.conditions.waterTemperature)&&setup(x,'blade-bait','tail-spinner') },
  { id:'PL045',sourceRuleId:'R013',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.78,effect:2,reasonCode:'SPINNERBAIT_OVER_COVER',sourceIds:['S06','S07'],matches:x=>x.conditions.vegetation==='edgeOrGaps'&&x.spotId==='vegetation'&&setup(x,'spinnerbait') },
  { id:'OBS020',sourceRuleId:'R035',target:'setup',group:'activityObservation',evidenceClass:'observation',confidence:.95,effect:3,reasonCode:'SURFACE_POPPER_WINDOW',sourceIds:['S16'],matches:x=>x.conditions.waterTemperature==='warm'&&x.conditions.depth==='shallow'&&sign(x.conditions,'surfaceActivity')&&(x.conditions.light==='dark'||x.conditions.light==='diffuse'||['dawn','dusk'].includes(x.conditions.timeOfDay))&&setup(x,'popper') },
  { id:'PL047',sourceRuleId:'R035',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:2,reasonCode:'POPPER_SURFACE_PRESENTATION',sourceIds:['S16'],matches:x=>x.conditions.waterTemperature==='warm'&&x.conditions.depth==='shallow'&&sign(x.conditions,'surfaceActivity')&&(x.conditions.light==='dark'||x.conditions.light==='diffuse'||['dawn','dusk'].includes(x.conditions.timeOfDay))&&setup(x,'popper') },
  { id:'PL048',sourceRuleId:'R035',target:'setup',group:'visibility',evidenceClass:'experience',confidence:.8,effect:2,reasonCode:'POPPER_LOW_LIGHT_SURFACE',sourceIds:['S16'],matches:x=>x.conditions.waterTemperature==='warm'&&x.conditions.depth==='shallow'&&sign(x.conditions,'surfaceActivity')&&(x.conditions.light==='dark'||x.conditions.light==='diffuse'||['dawn','dusk'].includes(x.conditions.timeOfDay))&&setup(x,'popper') },
  { id:'PL046',sourceRuleId:'R035',target:'setup',group:'thermalPhase',evidenceClass:'experience',confidence:.8,effect:-2,reasonCode:'POPPER_TEMPERATURE_MISMATCH',sourceIds:['S16'],matches:x=>['cold','cool','hot'].includes(x.conditions.waterTemperature)&&setup(x,'popper') },
  { id:'PL049',sourceRuleId:'R017',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:2,reasonCode:'CRANKBAIT_DROPOFF_DEPTH',sourceIds:['S01','S16'],matches:x=>x.spotId==='dropoff'&&['medium'].includes(x.conditions.depth)&&setup(x,'crankbait') },
  { id:'PL050',sourceRuleId:'R033',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.82,effect:-1,reasonCode:'COLD_BLADE_BEHIND_FINESSE',sourceIds:['S15','S16'],matches:x=>['cold'].includes(x.conditions.waterTemperature)&&x.conditions.activity.status!=='observed'&&setup(x,'blade-bait','tail-spinner') },
  { id:'PL051',sourceRuleId:'R032',target:'setup',group:'presentation',evidenceClass:'experience',confidence:.8,effect:2,reasonCode:'TAIL_SPINNER_SEARCH',sourceIds:['S16','S18'],matches:x=>setup(x,'tail-spinner')&&x.conditions.vegetation!=='dense'&&(x.conditions.season==='autumn'||x.conditions.depth==='deep')&&(sign(x.conditions,'baitfish')||sign(x.conditions,'huntingPerch')) },
]

export const allRules = [...spotRules, ...setupRules]

export const researchSources=sourceSubset(['S01','S02','S03','S04','S05','S06','S07','S10','S11','S15','S16','S18','S20','S24'])

export function evidencePoints(rule: ScoringRule): number {
  const factor = rule.evidenceClass === 'experience' ? .75 : rule.evidenceClass === 'weak' ? .35 : 1
  const scale = rule.evidenceClass === 'observation' ? 7 : 4
  return Math.round(rule.effect * scale * rule.confidence * factor)
}
