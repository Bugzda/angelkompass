export type WaterType = 'lake'|'river'|'canal'
export type Season = 'spring'|'summer'|'autumn'|'winter'
export type Known<T extends string> = T|'unknown'
export type SpotFeature = 'vegetation'|'rocks'|'vertical'|'bridge'|'inflow'|'current_break'|'harbor'|'shallow'|'dropoff'|'wood'
export type ActivitySign = 'baitfish'|'hunting'|'surface'
export type SizeClass = 'small'|'medium'|'large'
export type ColorFamily = 'natural'|'contrast'|'bright_uv'|'transparent'|'shock'
export type WeightClass = 'ultralight'|'light'|'medium'|'heavy'
export type Confidence = 'low'|'medium'|'high'

export interface Conditions { targetFish:'perch'; waterType:WaterType; season:Season; timeOfDay:Known<'dawn'|'day'|'dusk'|'night'>; turbidity:Known<'clear'|'slightly_turbid'|'turbid'>; current:Known<'none'|'weak'|'medium'|'strong'>; depth:Known<'shallow'|'medium'|'deep'>; observedStructure:SpotFeature[]; weatherTrend?:'stable'|'warming'|'cooling'|'front'; wind?:'calm'|'light'|'moderate'|'strong'; light?:'bright'|'diffuse'|'dark'; waterTemperature?:'cold'|'cool'|'mild'|'warm'; fishingPressure?:Known<'low'|'medium'|'high'>; activitySigns?:ActivitySign[] }
export interface FishProfile { id:'perch'; label:string; typicalSizes:SizeClass[]; structureAffinity:SpotFeature[] }
export interface SpotType { id:string; label:string; description:string; waters:WaterType[]; feature:SpotFeature; risks:string[]; seasonalAffinity:Season[]; priority:number }
export interface LureType { id:string; label:string; sizes:SizeClass[]; colors:ColorFamily[]; weights:WeightClass[]; mounting:string; guidance:string[]; depths:Array<Exclude<Conditions['depth'],'unknown'>>; currents:Array<Exclude<Conditions['current'],'unknown'>>; replacementIds:string[]; priority:number }
export interface ReasonContribution { ruleId:string; reasonCode:string; scoreDelta:number; evidence:string[] }
export interface RankedSpot { spot:SpotType; score:number; reasons:ReasonContribution[] }
export interface SetupRecommendation { lure:LureType; score:number; size:SizeClass; color:ColorFamily; weight:WeightClass; mounting:string; guidance:string; reasons:ReasonContribution[] }
export interface InventoryItem { id:string; lureTypeId:string; label?:string; sizeClass:SizeClass; colorFamily:ColorFamily; availableWeightClasses:WeightClass[]; quantityState:'available'|'low'|'empty'; enabled:boolean }
export interface InventoryMatch { item:InventoryItem; kind:'exact'|'replacement'; explanation:string }
export interface AttemptStep { index:number; title:string; spotLabel:string; setup:SetupRecommendation; limit:string; change:string; status:'active'|'pending'|'success' }
export interface Recommendation { id:string; spot:RankedSpot; primarySetup:SetupRecommendation; inventoryMatch?:InventoryMatch; reasonCodes:string[]; confidence:Confidence; alternatives:SetupRecommendation[]; attemptPlan:AttemptStep[] }
export interface AttemptFeedback { outcome:'bite'|'catch'|'no_success'; recommendationId:string; attemptStep:number; timestamp:string }
export interface FishingSession { id:string; rulesetVersion:string; conditions:Conditions; recommendations:Recommendation[]; feedback:AttemptFeedback[]; createdAt:string; completedAt?:string }
export const RULESET_VERSION = '1.0.0'
