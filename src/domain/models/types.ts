export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night' | 'unknown'
export type Turbidity = 'clear' | 'slightly_turbid' | 'turbid' | 'unknown'
export type Depth = 'shallow' | 'medium' | 'deep' | 'unknown'
export type SpotFeature = 'vegetation' | 'shallow' | 'dropoff'
export type SizeClass = 'small' | 'medium' | 'large'
export type ColorFamily = 'natural' | 'contrast' | 'transparent'
export type WeightClass = 'ultralight' | 'light' | 'medium' | 'heavy'
export type Confidence = 'low' | 'medium' | 'high'

export interface Conditions {
  targetFish: 'perch'
  waterType: 'lake'
  season: Season
  timeOfDay: TimeOfDay
  turbidity: Turbidity
  depth: Depth
  observedStructure: SpotFeature[]
}

export interface SpotType {
  id: SpotFeature
  label: string
  description: string
  seasonalAffinity: Season[]
  depthAffinity: Array<Exclude<Depth, 'unknown'>>
  priority: number
}

export interface LureType {
  id: 'jig' | 'ned' | 'drop-shot' | 'twitchbait' | 'spinner'
  label: string
  mounting: string
  guidance: string
  sizes: SizeClass[]
  depths: Array<Exclude<Depth, 'unknown'>>
  style: 'finesse' | 'bottom' | 'search'
  priority: number
}

export interface ReasonContribution {
  ruleId: string
  reasonCode: string
  scoreDelta: number
}

export interface RankedSpot {
  spot: SpotType
  score: number
  reasons: ReasonContribution[]
}

export interface RankedSetup {
  lure: LureType
  score: number
  size: SizeClass
  color: ColorFamily
  weight: WeightClass
  reasons: ReasonContribution[]
}

export interface Recommendation {
  rank: number
  spot: RankedSpot
  setup: RankedSetup
  confidence: Confidence
  reasons: string[]
  attemptLimit: string
  noBiteAlternative: string
}

export interface InventoryItem {
  lureTypeId: LureType['id']
}

export interface RecommendationDecision {
  expertRanking: Recommendation[]
  practicalPrimary?: Recommendation
  bestMissing?: Recommendation
  suitabilityGap: number
  suitabilityWarning?: string
}
