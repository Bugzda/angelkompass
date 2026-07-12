import {describe,expect,it} from 'vitest'
import {createRecommendationDecision,isRecommendationAvailable} from '../../domain/engine/scoring'
import type {Conditions,InventoryItem,SizeClass,TargetFish} from '../../domain/models/types'
import {profileFor} from '../../domain/species/profiles'

const conditionsFor=(targetFish:TargetFish,depth:Conditions['depth'],waterTemperature:Conditions['waterTemperature']='mild'):Conditions=>({
  targetFish,waterType:'lake',season:'summer',timeOfDay:'day',turbidity:'slightly_turbid',depth,waterTemperature,light:'diffuse',
  activity:{status:'none',signs:[]},vegetation:'none',observedStructure:[],structureStatus:'none',pikeSafetyConfirmed:targetFish==='pike'?true:undefined,
})

const inventoryFor=(fish:TargetFish,depth:Conditions['depth'],count:number):InventoryItem[]=>profileFor(fish).lures
  .filter(lure=>depth==='unknown'||lure.depths.includes(depth))
  .slice(0,count)
  .map(lure=>({targetFish:fish,lureTypeId:lure.id,sizes:[...lure.sizes]}))

describe('bestandsbasierte Top-Empfehlungen',()=>{
  for(const fish of ['perch','pike'] as const)for(const depth of ['shallow','medium','deep','unknown'] as const)for(const count of [0,1,2,3]){
    it(`${fish} ${depth}: zeigt ${count} vorhandene Optionen`,()=>{
      const conditions=conditionsFor(fish,depth)
      const decision=createRecommendationDecision(conditions,inventoryFor(fish,depth,count))
      expect(decision.practicalRanking).toHaveLength(count)
      expect(new Set(decision.practicalRanking.map(item=>item.setup.lure.id)).size).toBe(count)
      expect(decision.practicalRanking.every(item=>isRecommendationAvailable(conditions,inventoryFor(fish,depth,count),item))).toBe(true)
      const compatibleCount=profileFor(fish).lures.filter(lure=>depth==='unknown'||lure.depths.includes(depth)).length
      if(count<compatibleCount)expect(decision.optionalLureTip).toBeDefined();else expect(decision.optionalLureTip).toBeUndefined()
    })
  }

  it.each([
    {name:'bevorzugt mittel und nutzt klein vor groß',conditions:conditionsFor('perch','medium','warm'),sizes:['small','large'] as SizeClass[],expected:'small'},
    {name:'bevorzugt klein und nutzt mittel',conditions:conditionsFor('perch','medium','cold'),sizes:['medium'] as SizeClass[],expected:'medium'},
    {name:'bevorzugt groß und nutzt mittel',conditions:conditionsFor('pike','medium','warm'),sizes:['medium'] as SizeClass[],expected:'medium'},
  ])('$name',({conditions,sizes,expected})=>{
    const inventory:InventoryItem[]=[{targetFish:conditions.targetFish,lureTypeId:'jig',sizes}]
    const result=createRecommendationDecision(conditions,inventory).practicalRanking.find(item=>item.setup.lure.id==='jig')!
    expect(result.setup.size).toBe(expected)
    expect(result.inventoryFit).toEqual({preferredSize:conditions.targetFish==='pike'?'large':conditions.waterTemperature==='cold'?'small':'medium',selectedSize:expected,exact:false})
    expect(result.switchPlan[1].change).toContain(result.setup.lure.label)
  })

  it('behält eine exakt vorhandene Größe ohne Kompromiss',()=>{
    const conditions=conditionsFor('perch','deep','warm')
    const result=createRecommendationDecision(conditions,[{targetFish:'perch',lureTypeId:'jig',sizes:['medium']}]).practicalRanking[0]
    expect(result.inventoryFit).toEqual({preferredSize:'medium',selectedSize:'medium',exact:true})
  })
})
