export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night' | 'unknown'
export type Turbidity = 'clear' | 'slightly_turbid' | 'turbid' | 'unknown'
export type Depth = 'shallow' | 'medium' | 'deep' | 'unknown'
export type WaterTemperature = 'cold' | 'cool' | 'mild' | 'warm' | 'hot' | 'unknown'
export type Light = 'bright' | 'diffuse' | 'dark' | 'unknown'
export type ActivitySign = 'baitfish' | 'huntingPerch' | 'surfaceActivity'
export type ActivityObservation = { status: 'unknown' | 'none' | 'observed'; signs: ActivitySign[] }
export type Vegetation = 'none' | 'edgeOrGaps' | 'dense' | 'unknown'
export type SpotFeature = 'vegetation' | 'shallow' | 'dropoff'
export type ObservableStructure = Exclude<SpotFeature, 'vegetation'>
export type SizeClass = 'small' | 'medium' | 'large'
export type ColorFamily = 'natural' | 'contrast' | 'transparent'
export type WeightClass = 'ultralight' | 'light' | 'medium' | 'heavy'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type EvidenceClass = 'science' | 'experience' | 'weak' | 'observation'
export type RuleGroup = 'thermalPhase' | 'visibility' | 'habitatObservation' | 'activityObservation' | 'presentation' | 'control'

export interface Conditions {
  targetFish: 'perch'
  waterType: 'lake'
  season: Season
  timeOfDay: TimeOfDay
  turbidity: Turbidity
  depth: Depth
  waterTemperature: WaterTemperature
  light: Light
  activity: ActivityObservation
  vegetation: Vegetation
  observedStructure: ObservableStructure[]
}

export interface SpotType { id: SpotFeature; label: string; description: string; seasonalAffinity: Season[]; depthAffinity: Array<Exclude<Depth, 'unknown'>>; priority: number }
export interface LureType { id: 'jig' | 'ned' | 'drop-shot' | 'twitchbait' | 'spinner'; label: string; mounting: string; guidance: string; sizes: SizeClass[]; depths: Array<Exclude<Depth, 'unknown'>>; style: 'finesse' | 'bottom' | 'search'; priority: number }

export interface ReasonContribution {
  ruleId: string
  reasonCode: string
  group: RuleGroup
  evidenceClass: EvidenceClass
  evidenceConfidence: number
  rawDelta: number
  appliedDelta: number
}

export interface RankedSpot { spot: SpotType; score: number; reasons: ReasonContribution[] }
export interface RankedSetup { lure: LureType; score: number; size: SizeClass; color: ColorFamily; weight: WeightClass; reasons: ReasonContribution[] }
export interface ConfidenceMetric { value: number; level: ConfidenceLevel; explanation: string; missingFields?: string[]; contributingRules?: number }
export interface SwitchStep { phase: 'initial' | 'refine' | 'move'; title: string; change: string; limit: string; reason: string }
export interface ColorGuidance { family: ColorFamily; familyLabel: string; examples: string[]; reason: string }

export interface Recommendation {
  rank: number
  spot: RankedSpot
  setup: RankedSetup
  inputCoverage: ConfidenceMetric
  evidenceQuality: ConfidenceMetric
  colorGuidance: ColorGuidance
  reasons: string[]
  switchPlan: SwitchStep[]
}

export interface InventoryItem { lureTypeId: LureType['id'] }
export interface RecommendationDecision { expertRanking: Recommendation[]; practicalPrimary?: Recommendation; bestMissing?: Recommendation; suitabilityGap: number; suitabilityWarning?: string; hotWaterWarning?: string }
