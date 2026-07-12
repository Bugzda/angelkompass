import {describe,expect,it} from 'vitest'
import {createRecommendationDecision,createRecommendations,evaluateSetups,evaluateSpots} from '../../domain/engine/scoring'
import type {Conditions} from '../../domain/models/types'
import {pikeLures} from '../../domain/catalogs/pikeLures'
import {pikeAllRules} from '../../domain/rules/pikeLakeRules'

const base:Conditions={targetFish:'pike',waterType:'lake',season:'summer',timeOfDay:'day',turbidity:'slightly_turbid',depth:'medium',waterTemperature:'mild',light:'diffuse',activity:{status:'none',signs:[]},vegetation:'none',observedStructure:[],pikeSafetyConfirmed:true}
const scenarios:Conditions[]=[
 {...base,season:'spring',depth:'shallow',waterTemperature:'unknown'}, {...base,season:'summer',depth:'shallow',waterTemperature:'warm'},
 {...base,season:'autumn',depth:'medium',waterTemperature:'cool'}, {...base,season:'winter',depth:'deep',waterTemperature:'cold'},
 {...base,turbidity:'clear',light:'bright'}, {...base,turbidity:'turbid',light:'diffuse'}, {...base,timeOfDay:'dawn',light:'dark'}, {...base,timeOfDay:'dusk'},
 {...base,vegetation:'edgeOrGaps',observedStructure:['shallow']}, {...base,vegetation:'dense',depth:'shallow'},
 {...base,observedStructure:['hardCover']}, {...base,observedStructure:['dropoff'],depth:'deep'},
 {...base,activity:{status:'observed',signs:['baitfish']}}, {...base,activity:{status:'observed',signs:['pikeContact']}},
 {...base,depth:'shallow',waterTemperature:'warm',activity:{status:'observed',signs:['surfaceActivity']}},
 {...base,depth:'shallow',activity:{status:'observed',signs:['baitfish','pikeContact']}},
 {...base,waterTemperature:'hot',depth:'shallow'}, {...base,waterTemperature:'hot',depth:'medium'},
 {...base,depth:'unknown',waterTemperature:'unknown',light:'unknown',turbidity:'unknown',vegetation:'unknown',activity:{status:'unknown',signs:[]}},
 {...base,depth:'deep',season:'autumn'}, {...base,depth:'medium',vegetation:'edgeOrGaps',activity:{status:'observed',signs:['baitfish']}},
 {...base,depth:'shallow',observedStructure:['hardCover'],activity:{status:'observed',signs:['pikeContact']}},
 {...base,depth:'medium',turbidity:'turbid',vegetation:'edgeOrGaps'}, {...base,depth:'deep',waterTemperature:'cool',observedStructure:['dropoff']},
]

describe('24 Hecht-Golden-Szenarien',()=>{
 it.each(scenarios.map((conditions,index)=>({name:`Hecht-Szenario ${index+1}`,conditions})))('$name',({conditions})=>{const result=createRecommendations(conditions);expect(result).toHaveLength(3);expect(new Set(result.map(item=>item.setup.lure.id)).size).toBe(3);expect(result.every(item=>item.reasons.length>0&&item.switchPlan.length===3)).toBe(true)})
 it('enthält genau neun vollständige Hecht-Ködertypen',()=>{expect(pikeLures).toHaveLength(9);expect(new Set(pikeLures.map(item=>item.id)).size).toBe(9);expect(pikeLures.every(item=>item.sizes.includes('medium')&&item.depths.length&&item.sizeRangesCm&&item.presentations?.length)).toBe(true)})
 it('hält tiefe und flache Köder kompatibel',()=>{const deep={...base,depth:'deep' as const};const deepIds=evaluateSetups(deep,evaluateSpots(deep)[0]).map(item=>item.lure.id);expect(deepIds).not.toContain('popper');expect(deepIds).toEqual(expect.arrayContaining(['jig','spoon','swimbait']))})
 it('lässt Bestand das Fachranking niemals verändern',()=>{const empty=createRecommendationDecision(base,[]).expertRanking;const stocked=createRecommendationDecision(base,pikeLures.map(lure=>({lureTypeId:lure.id,sizes:['large']}))).expertRanking;expect(stocked).toEqual(empty)})
 it('wertet Altbestand und kleine Größen nicht als hechtgeeignet',()=>{expect(createRecommendationDecision(base,[{lureTypeId:'jig',legacyPerch:true},{lureTypeId:'spinner',sizes:['small']}]).practicalPrimary).toBeUndefined()})
 it('hat eindeutige Regel-IDs und dokumentierte Metadaten',()=>{expect(new Set(pikeAllRules.map(rule=>rule.id)).size).toBe(pikeAllRules.length);expect(pikeAllRules.every(rule=>rule.reasonCode&&rule.group&&rule.confidence>0&&rule.sourceIds)).toBe(true)})
})
